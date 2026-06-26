type PdfParseResponse = {
  text: string
  pages: number
}

export async function readPdfText(file: File): Promise<PdfParseResponse> {
  const buffer = await file.arrayBuffer()
  const payload = Array.from(new Uint8Array(buffer))

  return window.ipcRenderer.invoke("pdf:extract-text", {
    fileName: file.name,
    data: payload,
  })
}
