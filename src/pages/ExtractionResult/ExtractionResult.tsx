import {
  DeleteOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons"
import { Button, Descriptions, Empty, Space, Tag } from "antd"
import { ExtractionTable } from "../../components/ExtractionTable/ExtractionTable"
import type { ExtractedPdfResult } from "../../modules/pdf/models/extracted-pdf-result.model"
import { statusColors } from "../../shared/constants/statusColors"
import { formatFileSize } from "../../shared/utils/formatFileSize"
import "./ExtractionResult.styles.css"

type ExtractionResultProps = {
  result?: ExtractedPdfResult
  storagePath: string
  onUploadClick: () => void
  onFavoriteToggle: (documentId: string) => void
  onTrashToggle: (document: ExtractedPdfResult) => void
}

export function ExtractionResult({
  result,
  storagePath,
  onUploadClick,
  onFavoriteToggle,
  onTrashToggle,
}: ExtractionResultProps) {
  if (!result) {
    return (
      <div className="view-page view-page-centered">
        <Empty description="Selecione um PDF recente ou faÃ§a o upload de um novo para ver os resultados da extraÃ§Ã£o." />
        <Button type="primary" onClick={onUploadClick}>
          Ler PDF
        </Button>
      </div>
    )
  }

  return (
    <div className="view-page results-screen">
      <div className="results-content">
        <div className="workspace-title-row">
          <div className="workspace-title">
            <h1>{result.fileName}</h1>
            <p>{result.items.length} itens extraídos</p>
          </div>
          <Space>
            <Tag color={statusColors[result.status]}>{result.status}</Tag>
            <Button
              icon={result.favorite ? <StarFilled /> : <StarOutlined />}
              onClick={() => onFavoriteToggle(result.id)}
            />
            <Button danger icon={<DeleteOutlined />} onClick={() => onTrashToggle(result)} />
          </Space>
        </div>
        <ExtractionTable result={result} />
      </div>

      <aside className="documents-panel document-details-panel">
        <h2 className="section-title">Detalhes do documento</h2>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Tipo">{result.documentType}</Descriptions.Item>
          <Descriptions.Item label="Páginas">{result.pageCount}</Descriptions.Item>
          <Descriptions.Item label="Tamanho do arquivo">{formatFileSize(result.fileSize)}</Descriptions.Item>
          <Descriptions.Item label="Produtos">{result.items.length}</Descriptions.Item>
          {result.issueDate ? <Descriptions.Item label="Data de emissão">{result.issueDate}</Descriptions.Item> : null}
          {result.accessKey ? <Descriptions.Item label="Chave de acesso">{result.accessKey}</Descriptions.Item> : null}
        </Descriptions>
        <div className="storage-note">
          <strong>Salvo em</strong>
          <span>{storagePath || "Dados do usuário do Electron"}</span>
        </div>
      </aside>
    </div>
  )
}
