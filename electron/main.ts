import { app, BrowserWindow, ipcMain } from "electron"
import { createRequire } from "node:module"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { fileURLToPath, pathToFileURL } from "node:url"
import path from "node:path"
import { PDFParse } from "pdf-parse"

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, "..")

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"]
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron")
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist")

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST

const pdfWorkerPath = require.resolve("pdfjs-dist/build/pdf.worker.mjs")
PDFParse.setWorker(pathToFileURL(pdfWorkerPath).toString())

let win: BrowserWindow | null

type PdfExtractPayload = {
  fileName: string
  data: number[]
}

type StoredDocument = {
  id: string
  updatedAt: string
  [key: string]: unknown
}

function getDocumentsStorePath(): string {
  return path.join(app.getPath("userData"), "documents.json")
}

async function readDocumentsStore(): Promise<StoredDocument[]> {
  try {
    const content = await readFile(getDocumentsStorePath(), "utf-8")
    const parsedValue = JSON.parse(content) as unknown
    return Array.isArray(parsedValue) ? parsedValue as StoredDocument[] : []
  } catch {
    return []
  }
}

async function writeDocumentsStore(documents: StoredDocument[]): Promise<StoredDocument[]> {
  const storePath = getDocumentsStorePath()
  await mkdir(path.dirname(storePath), { recursive: true })
  await writeFile(storePath, JSON.stringify(documents, null, 2), "utf-8")
  return documents
}

function sortDocuments(documents: StoredDocument[]): StoredDocument[] {
  return documents.sort((firstDocument, secondDocument) => {
    return new Date(secondDocument.updatedAt).getTime() - new Date(firstDocument.updatedAt).getTime()
  })
}

ipcMain.handle("pdf:extract-text", async (_event, payload: PdfExtractPayload) => {
  const parser = new PDFParse({ data: Buffer.from(payload.data) })

  try {
    const result = await parser.getText()
    return {
      text: result.text,
      pages: result.total,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown PDF parsing error"
    throw new Error(`Could not extract text from ${payload.fileName}: ${message}`)
  } finally {
    await parser.destroy()
  }
})

ipcMain.handle("documents:list", async () => {
  return sortDocuments(await readDocumentsStore())
})

ipcMain.handle("documents:save", async (_event, document: StoredDocument) => {
  const documents = await readDocumentsStore()
  const existingIndex = documents.findIndex((storedDocument) => storedDocument.id === document.id)
  const documentToSave = {
    ...document,
    updatedAt: new Date().toISOString(),
  }

  if (existingIndex >= 0) {
    documents[existingIndex] = documentToSave
  } else {
    documents.unshift(documentToSave)
  }

  return writeDocumentsStore(sortDocuments(documents))
})

ipcMain.handle("documents:update", async (_event, payload: { documentId: string; patch: Partial<StoredDocument> }) => {
  const documents = await readDocumentsStore()
  const updatedDocuments = documents.map((document) => {
    if (document.id !== payload.documentId) {
      return document
    }

    return {
      ...document,
      ...payload.patch,
      updatedAt: new Date().toISOString(),
    }
  })

  return writeDocumentsStore(sortDocuments(updatedDocuments))
})


ipcMain.handle("documents:delete", async (_event, payload: { documentId: string }) => {
  const documents = await readDocumentsStore()
  const updatedDocuments = documents.filter((document) => document.id !== payload.documentId)
  return writeDocumentsStore(sortDocuments(updatedDocuments))
})
ipcMain.handle("documents:store-path", async () => {
  return getDocumentsStorePath()
})

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"))
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
    win = null
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

void require

