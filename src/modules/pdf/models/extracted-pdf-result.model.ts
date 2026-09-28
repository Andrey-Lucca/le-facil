import type { ExtractedProductItem } from "./extracted-product-item.model"

export type DocumentType = "invoice" | "bank_slip" | "unknown"
export type ExtractionStatus = "success" | "partial" | "failed"

export interface ExtractedInstallment {
  number: string
  dueDate: string
  amount: number
}

export interface ExtractedPdfResult {
  id: string
  fileName: string
  documentType: DocumentType
  accessKey?: string
  issuerName?: string
  recipientName?: string
  issueDate?: string
  totalAmount?: number
  invoiceNumber?: string
  installment?: string
  installmentCount?: number
  installments?: Record<string, ExtractedInstallment>
  dueDate?: string
  paidAmount?: number
  paymentDate?: string
  paymentStatus?: "A pagar"
  paymentMethod?: string
  costCenter?: string
  observations?: string
  attachmentLink?: string
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
