/// <reference types="vite/client" />

type PdfExtractPayload = {
  fileName: string
  data: number[]
}

type PdfExtractResponse = {
  text: string
  pages: number
}

type IpcRendererApi = {
  on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void
  off: (channel: string, listener: (...args: unknown[]) => void) => void
  send: (channel: string, ...args: unknown[]) => void
  invoke: (channel: "pdf:extract-text", payload: PdfExtractPayload) => Promise<PdfExtractResponse>
}

interface Window {
  ipcRenderer: IpcRendererApi
}
