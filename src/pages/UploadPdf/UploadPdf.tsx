import { Alert, Spin } from "antd"
import { PdfUploadArea } from "../../components/PdfUploadArea/PdfUploadArea"
import type { ExtractedPdfResult } from "../../modules/pdf/models/extracted-pdf-result.model"
import "./UploadPdf.styles.css"

type UploadPdfProps = {
  documents: ExtractedPdfResult[]
  errorMessage: string
  isReading: boolean
  onFileSelected: (file: File) => void
}

export function UploadPdf({ documents, errorMessage, isReading, onFileSelected }: UploadPdfProps) {
  return (
    <div className="view-page view-page-centered upload-page">
      <section className="upload-page__header">
        <h1>Ler DANFE/NF-e</h1>
        <p>Adicione um PDF DANFE/NF-e para extrair produtos e serviços.</p>
      </section>

      {errorMessage ? <Alert type="error" showIcon message={errorMessage} className="read-alert" /> : null}

      <Spin spinning={isReading} tip="Lendo PDF...">
        <PdfUploadArea loading={isReading} hasDocuments={documents.length > 0} onFileSelected={onFileSelected} />
      </Spin>
    </div>
  )
}
