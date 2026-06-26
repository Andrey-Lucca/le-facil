import type { ExtractedProductItem } from "./extracted-product-item.model"

export type DocumentType = "invoice" | "bank_slip" | "unknown"
export type ExtractionStatus = "success" | "partial" | "failed"

export interface ExtractedPdfResult {
  id: string
  fileName: string
  documentType: DocumentType
  accessKey?: string
  issuerName?: string
  recipientName?: string
  issueDate?: string
  totalAmount?: number
  items: ExtractedProductItem[]
  status: ExtractionStatus
  rawText: string
  createdAt: string
}
