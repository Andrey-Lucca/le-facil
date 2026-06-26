import {
  ClockCircleOutlined,
  DeleteOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  //StarOutlined,
  UploadOutlined,
} from "@ant-design/icons"
import { Button } from "antd"
import type { ExtractedPdfResult } from "../../modules/pdf/models/extracted-pdf-result.model"
import { themeTokens } from "../../shared/theme/themeTokens"
import type { NavigationView } from "../../shared/types/navigation-view.type"
import "./Sidebar.styles.css"

type SidebarProps = {
  documents: ExtractedPdfResult[]
  activeView: NavigationView
  selectedDocumentId?: string
  onViewChange: (view: NavigationView) => void
  onDocumentSelect: (document: ExtractedPdfResult) => void
}

const viewLinks: Array<{ key: NavigationView; label: string; icon: JSX.Element }> = [
  { key: "all", label: "Documentos", icon: <FolderOpenOutlined /> },
  { key: "recent", label: "Recentes", icon: <ClockCircleOutlined /> },
  // { key: "favorites", label: "Favoritos", icon: <StarOutlined /> },
  { key: "trash", label: "Lixeira", icon: <DeleteOutlined /> },
]

const dotColors = [
  themeTokens.accentOrange,
  themeTokens.accentBlue,
  themeTokens.accentPurple,
  themeTokens.accentPink,
]

function formatRelativeDate(value: string): string {
  const date = new Date(value)
  const today = new Date()
  const diffInDays = Math.floor((today.getTime() - date.getTime()) / 86_400_000)

  if (diffInDays <= 0) {
    return "Today"
  }

  if (diffInDays === 1) {
    return "Yesterday"
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function Sidebar({
  documents,
  activeView,
  selectedDocumentId,
  onViewChange,
  onDocumentSelect,
}: SidebarProps) {
  const visibleRecentDocuments = documents.filter((document) => !document.deleted).slice(0, 5)

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <FileTextOutlined />
        <strong>Lê Fácil</strong>
      </div>

      <nav className="sidebar-nav">
        <Button
          type="primary"
          icon={<UploadOutlined />}
          className={`sidebar-upload ${activeView === "upload" ? "active" : ""}`}
          onClick={() => onViewChange("upload")}
        >
          Upload PDF
        </Button>

        {viewLinks.map((link) => (
          <button
            className={`sidebar-link ${activeView === link.key ? "active" : ""}`}
            type="button"
            key={link.key}
            onClick={() => onViewChange(link.key)}
          >
            {link.icon} {link.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-recent">
        <span className="sidebar-section-title">Recent Files</span>
        {visibleRecentDocuments.length === 0 ? (
          <p className="sidebar-empty">No PDFs saved yet.</p>
        ) : (
          visibleRecentDocuments.map((document, index) => (
            <button
              className={`recent-file ${selectedDocumentId === document.id ? "selected" : ""}`}
              key={document.id}
              type="button"
              onClick={() => onDocumentSelect(document)}
            >
              <span className="recent-dot" style={{ background: dotColors[index % dotColors.length] }} />
              <div>
                <strong>{document.fileName}</strong>
                <small>{formatRelativeDate(document.updatedAt)}</small>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  )
}
