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
      <h2>{hasDocuments ? "Add another PDF" : "Upload Your First PDF"}</h2>
      <p>Drag and drop your PDF files or click to browse</p>
      <Button type="primary" icon={<FilePdfOutlined />} loading={loading}>
        Choose PDF
      </Button>
    </Upload.Dragger>
  )
}
