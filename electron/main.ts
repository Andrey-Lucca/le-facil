import { app, BrowserWindow, ipcMain } from "electron"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { PDFParse } from "pdf-parse"

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, "..")

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"]
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron")
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist")

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST

let win: BrowserWindow | null

type PdfExtractPayload = {
  fileName: string
  data: number[]
}

ipcMain.handle("pdf:extract-text", async (_event, payload: PdfExtractPayload) => {
  const parser = new PDFParse({ data: Buffer.from(payload.data) })

  try {
    const result = await parser.getText()
    return {
      text: result.text,
      pages: result.total,
    }
  } finally {
    await parser.destroy()
  }
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
