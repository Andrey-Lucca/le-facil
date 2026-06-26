import type { ExtractedPdfResult } from "../models/extracted-pdf-result.model"
import { parseExtractedPdf } from "./invoiceParser.service"
import { readPdfText } from "./pdfReader.service"

export async function extractPdf(file: File): Promise<ExtractedPdfResult> {
  const { text } = await readPdfText(file)
  return parseExtractedPdf(file.name, text)
}
