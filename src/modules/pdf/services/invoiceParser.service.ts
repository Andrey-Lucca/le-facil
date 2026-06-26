import type {
  DocumentType,
  ExtractedPdfResult,
  ExtractionStatus,
} from "../models/extracted-pdf-result.model"
import type { ExtractedProductItem } from "../models/extracted-product-item.model"
import { normalizeCurrency } from "../utils/normalizeCurrency"
import { parseInvoiceProductLine } from "../utils/tableLineParser"

function detectDocumentType(text: string): DocumentType {
  const normalizedText = text.toUpperCase()

  if (normalizedText.includes("DANFE") || normalizedText.includes("NF-E") || normalizedText.includes("NOTA FISCAL")) {
    return "invoice"
  }

  if (normalizedText.includes("BOLETO") || normalizedText.includes("LINHA DIGITAVEL")) {
    return "bank_slip"
  }

  return "unknown"
}

function extractAccessKey(text: string): string | undefined {
  return text.match(/\b\d{44}\b/)?.[0]
}

function extractIssueDate(text: string): string | undefined {
  return text.match(/\b\d{2}\/\d{2}\/\d{4}\b/)?.[0]
}

function extractTotalAmount(text: string): number | undefined {
  const totalMatch = text.match(/VALOR\s+TOTAL\s+DA\s+NOTA[\s\S]{0,80}?(\d{1,3}(?:\.\d{3})*,\d{2}|\d+,\d{2})/i)
  return totalMatch ? normalizeCurrency(totalMatch[1]) : undefined
}

function inferStatus(documentType: DocumentType, items: ExtractedProductItem[], rawText: string): ExtractionStatus {
  if (!rawText.trim()) {
    return "failed"
  }

  if (documentType === "invoice" && items.length > 0) {
    return "success"
  }

  return "partial"
}

function extractInvoiceItems(text: string): ExtractedProductItem[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return lines.reduce<ExtractedProductItem[]>((items, line) => {
    const parsedItem = parseInvoiceProductLine(line)
    if (parsedItem) {
      items.push(parsedItem)
    }
    return items
  }, [])
}

export function parseExtractedPdf(fileName: string, rawText: string): ExtractedPdfResult {
  const documentType = detectDocumentType(rawText)
  const items = documentType === "invoice" ? extractInvoiceItems(rawText) : []
  const status = inferStatus(documentType, items, rawText)

  return {
    id: crypto.randomUUID(),
    fileName,
    documentType,
    accessKey: extractAccessKey(rawText),
    issueDate: extractIssueDate(rawText),
    totalAmount: extractTotalAmount(rawText),
    items,
    status,
    rawText,
    createdAt: new Date().toISOString(),
  }
}
