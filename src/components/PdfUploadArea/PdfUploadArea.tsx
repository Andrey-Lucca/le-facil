import { CloudUploadOutlined, FilePdfOutlined } from "@ant-design/icons"
import { Button, Upload } from "antd"
import type { UploadProps } from "antd"
import "./PdfUploadArea.styles.css"

type PdfUploadAreaProps = {
  loading: boolean
  hasDocuments: boolean
  onFileSelected: (file: File) => void
}

export function PdfUploadArea({ loading, hasDocuments, onFileSelected }: PdfUploadAreaProps) {
  const uploadProps: UploadProps = {
    accept: ".pdf,application/pdf",
    maxCount: 1,
    showUploadList: false,
    beforeUpload: (file) => {
      onFileSelected(file)
      return false
    },
  }

  return (
    <Upload.Dragger className="upload-area" disabled={loading} {...uploadProps}>
      <div className="upload-icon-wrap">
        <CloudUploadOutlined />
      </div>
      <h2>{hasDocuments ? "Adicionar PDF" : "Adicionar seu primeiro PDF"}</h2>
      <p>Arraste e solte aqui os arquivos ou clique e busque os arquivos</p>
      <Button type="primary" icon={<FilePdfOutlined />} loading={loading}>
        Escolher PDF
      </Button>
    </Upload.Dragger>
  )
}
