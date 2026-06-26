import type { ExtractedPdfResult } from "../../pdf/models/extracted-pdf-result.model"

const STORAGE_KEY = "le-facil:documents"

export function loadSavedDocuments(): ExtractedPdfResult[] {
  const storedValue = localStorage.getItem(STORAGE_KEY)
  if (!storedValue) {
    return []
  }

  try {
    return JSON.parse(storedValue) as ExtractedPdfResult[]
  } catch {
    return []
  }
}

export function saveDocument(document: ExtractedPdfResult): ExtractedPdfResult[] {
  const documents = [document, ...loadSavedDocuments()]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
  return documents
}
