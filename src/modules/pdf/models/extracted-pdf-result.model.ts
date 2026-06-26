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
  pageCount: number
  fileSize: number
  items: ExtractedProductItem[]
  status: ExtractionStatus
  rawText: string
  favorite: boolean
  deleted: boolean
  createdAt: string
  updatedAt: string
}
