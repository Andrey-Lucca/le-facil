import type { ExtractedPdfResult } from "../../pdf/models/extracted-pdf-result.model"

const LEGACY_STORAGE_KEY = "le-facil:documents"

function normalizeStoredDocument(document: Partial<ExtractedPdfResult>): ExtractedPdfResult {
  const now = new Date().toISOString()

  return {
    id: document.id ?? crypto.randomUUID(),
    fileName: document.fileName ?? "Untitled PDF",
    documentType: document.documentType ?? "unknown",
    accessKey: document.accessKey,
    issuerName: document.issuerName,
    recipientName: document.recipientName,
    issueDate: document.issueDate,
    totalAmount: document.totalAmount,
    pageCount: document.pageCount ?? 0,
    fileSize: document.fileSize ?? 0,
    items: document.items ?? [],
    status: document.status ?? "partial",
    rawText: document.rawText ?? "",
    favorite: document.favorite ?? false,
    deleted: document.deleted ?? false,
    createdAt: document.createdAt ?? now,
    updatedAt: document.updatedAt ?? document.createdAt ?? now,
  }
}

function normalizeDocuments(documents: Partial<ExtractedPdfResult>[]): ExtractedPdfResult[] {
  return documents.map(normalizeStoredDocument).sort(sortByUpdatedAt)
}

function loadLegacyLocalStorageDocuments(): ExtractedPdfResult[] {
  const storedValue = localStorage.getItem(LEGACY_STORAGE_KEY)
  if (!storedValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Partial<ExtractedPdfResult>[]
    return Array.isArray(parsedValue) ? normalizeDocuments(parsedValue) : []
  } catch {
    return []
  }
}

async function migrateLegacyDocuments(): Promise<ExtractedPdfResult[]> {
  const legacyDocuments = loadLegacyLocalStorageDocuments()
  if (legacyDocuments.length === 0) {
    return []
  }

  let migratedDocuments: ExtractedPdfResult[] = []
  for (const document of legacyDocuments) {
    migratedDocuments = await window.ipcRenderer.invoke("documents:save", document)
  }

  localStorage.removeItem(LEGACY_STORAGE_KEY)
  return normalizeDocuments(migratedDocuments)
}

export async function loadSavedDocuments(): Promise<ExtractedPdfResult[]> {
  const documents = normalizeDocuments(await window.ipcRenderer.invoke("documents:list"))
  if (documents.length > 0) {
    return documents
  }

  return migrateLegacyDocuments()
}

export async function saveDocument(document: ExtractedPdfResult): Promise<ExtractedPdfResult[]> {
  const documents = await window.ipcRenderer.invoke("documents:save", document)
  return normalizeDocuments(documents)
}

export async function updateDocument(documentId: string, patch: Partial<ExtractedPdfResult>): Promise<ExtractedPdfResult[]> {
  const documents = await window.ipcRenderer.invoke("documents:update", { documentId, patch })
  return normalizeDocuments(documents)
}

export async function toggleDocumentFavorite(documentId: string): Promise<ExtractedPdfResult[]> {
  const documents = await loadSavedDocuments()
  const document = documents.find((storedDocument) => storedDocument.id === documentId)
  return updateDocument(documentId, { favorite: !document?.favorite })
}

export async function moveDocumentToTrash(documentId: string): Promise<ExtractedPdfResult[]> {
  return updateDocument(documentId, { deleted: true })
}

export async function restoreDocumentFromTrash(documentId: string): Promise<ExtractedPdfResult[]> {
  return updateDocument(documentId, { deleted: false })
}

export async function deleteDocument(documentId: string): Promise<ExtractedPdfResult[]> {
  const documents = await window.ipcRenderer.invoke("documents:delete", { documentId })
  return normalizeDocuments(documents)
}

export async function getDocumentsStorePath(): Promise<string> {
  return window.ipcRenderer.invoke("documents:store-path")
}

export function sortByUpdatedAt(firstDocument: ExtractedPdfResult, secondDocument: ExtractedPdfResult): number {
  return new Date(secondDocument.updatedAt).getTime() - new Date(firstDocument.updatedAt).getTime()
}

