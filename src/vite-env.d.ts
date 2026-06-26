/// <reference types="vite/client" />

import type { ExtractedPdfResult } from "./modules/pdf/models/extracted-pdf-result.model"

type PdfExtractPayload = {
  fileName: string
  data: number[]
}

type PdfExtractResponse = {
  text: string
  pages: number
}

type DocumentUpdatePayload = {
  documentId: string
  patch: Partial<ExtractedPdfResult>
}

type IpcRendererApi = {
  on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void
  off: (channel: string, listener: (...args: unknown[]) => void) => void
  send: (channel: string, ...args: unknown[]) => void
  invoke: {
    (channel: "pdf:extract-text", payload: PdfExtractPayload): Promise<PdfExtractResponse>
    (channel: "documents:list"): Promise<ExtractedPdfResult[]>
    (channel: "documents:save", payload: ExtractedPdfResult): Promise<ExtractedPdfResult[]>
    (channel: "documents:update", payload: DocumentUpdatePayload): Promise<ExtractedPdfResult[]>
    (channel: "documents:store-path"): Promise<string>
  }
}

interface Window {
  ipcRenderer: IpcRendererApi
}
