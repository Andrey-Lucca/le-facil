import {
  ClockCircleOutlined,
  DeleteOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  //StarOutlined,
  UploadOutlined,
} from "@ant-design/icons"
import { Button } from "antd"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import type { ExtractedPdfResult } from "../../modules/pdf/models/extracted-pdf-result.model"
import { themeTokens } from "../../shared/theme/themeTokens"
import "./Sidebar.styles.css"

type SidebarProps = {
  documents: ExtractedPdfResult[]
  selectedDocumentId?: string
  onDocumentSelect: (document: ExtractedPdfResult) => void
}

const viewLinks = [
  { to: "/", label: "Documentos", icon: <FolderOpenOutlined /> },
  { to: "/recent", label: "Recentes", icon: <ClockCircleOutlined /> },
  // { key: "favorites", label: "Favoritos", icon: <StarOutlined /> },
  { to: "/trash", label: "Lixeira", icon: <DeleteOutlined /> },
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
    return "Hoje"
  }

  if (diffInDays === 1) {
    return "Ontem"
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function Sidebar({
  documents,
  selectedDocumentId,
  onDocumentSelect,
}: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
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
          className={`sidebar-upload ${location.pathname === "/upload" ? "active" : ""}`}
          onClick={() => navigate("/upload")}
        >
          Upload PDF
        </Button>

        {viewLinks.map((link) => (
          <NavLink
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            key={link.to}
            to={link.to}
            end={link.to === "/"}
          >
            {link.icon} {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-recent">
        <span className="sidebar-section-title">Arquivos recentes</span>
        {visibleRecentDocuments.length === 0 ? (
          <p className="sidebar-empty">Nenhum PDF salvo ainda.</p>
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
