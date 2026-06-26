import type { ExtractedPdfResult } from "../../pdf/models/extracted-pdf-result.model"

export async function saveDocumentToMongo(document: ExtractedPdfResult): Promise<ExtractedPdfResult> {
  return document
}
