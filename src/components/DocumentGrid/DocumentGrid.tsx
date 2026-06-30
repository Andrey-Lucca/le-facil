import {
  DeleteOutlined,
  FileTextOutlined,
  StarFilled,
  StarOutlined,
  UndoOutlined,
} from "@ant-design/icons"
import { Button, Progress, Space, Tag } from "antd"
import type { ExtractedPdfResult } from "../../modules/pdf/models/extracted-pdf-result.model"
import { statusColors } from "../../shared/constants/statusColors"
import { themeTokens } from "../../shared/theme/themeTokens"
import { formatFileSize } from "../../shared/utils/formatFileSize"
import "./DocumentGrid.styles.css"

type DocumentGridProps = {
  documents: ExtractedPdfResult[]
  selectedDocumentId?: string
  emptyTitle: string
  emptyDescription: string
  onOpenDocument: (document: ExtractedPdfResult) => void
  onFavoriteToggle: (documentId: string) => void
  onTrashToggle?: (document: ExtractedPdfResult) => void
  onRestore?: (documentId: string) => void
  onDelete?: (documentId: string) => void
}

export function DocumentGrid({
  documents,
  selectedDocumentId,
  emptyTitle,
  emptyDescription,
  onOpenDocument,
  onFavoriteToggle,
  onTrashToggle,
  onRestore,
  onDelete,
}: DocumentGridProps) {
  if (documents.length === 0) {
    return (
      <div className="empty-card">
        <strong>{emptyTitle}</strong>
        <span>{emptyDescription}</span>
      </div>
    )
  }

  return (
    <div className="reading-grid">
      {documents.map((document) => (
        <article className={`reading-card ${selectedDocumentId === document.id ? "selected" : ""}`} key={document.id}>
          <button className="reading-select" type="button" onClick={() => onOpenDocument(document)}>
            <span className="reading-icon" style={{ background: document.favorite ? themeTokens.accentOrange : themeTokens.accentBlue }}>
              <FileTextOutlined />
            </span>
            <div className="reading-content">
              <strong>{document.fileName}</strong>
              <span>{document.pageCount} Páginas · {formatFileSize(document.fileSize)}</span>
              <small>{document.items.length} Itens extraidos</small>
              <Progress
                percent={document.status === "success" ? 100 : document.status === "partial" ? 55 : 10}
                showInfo={false}
                strokeColor={document.status === "success" ? "#79C779" : themeTokens.accentPurple}
                trailColor="#F1EBDD"
              />
            </div>
          </button>
          <div className="reading-actions">
            <Tag color={statusColors[document.status]}>{document.status}</Tag>
            <Space size={4}>
              {!document.deleted ? (
                <>
                  <Button
                    type="text"
                    shape="circle"
                    icon={document.favorite ? <StarFilled /> : <StarOutlined />}
                    onClick={() => onFavoriteToggle(document.id)}
                  />
                  {onTrashToggle ? (
                    <Button
                      type="text"
                      shape="circle"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => onTrashToggle(document)}
                    />
                  ) : null}
                </>
              ) : null}

              {document.deleted && onRestore ? (
                <Button
                  type="text"
                  shape="circle"
                  icon={<UndoOutlined />}
                  onClick={() => onRestore(document.id)}
                />
              ) : null}

              {document.deleted && onDelete ? (
                <Button
                  type="text"
                  shape="circle"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(document.id)}
                />
              ) : null}
            </Space>
          </div>
        </article>
      ))}
    </div>
  )
}
