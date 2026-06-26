import {
  ClockCircleOutlined,
  DeleteOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  StarOutlined,
  UploadOutlined,
} from "@ant-design/icons"
import { Button } from "antd"

const recentFiles = [
  { name: "Project Proposal.pdf", date: "Today", color: "#F6D49B" },
  { name: "Annual Report.pdf", date: "Yesterday", color: "#B8CCFA" },
  { name: "Research Paper.pdf", date: "May 5", color: "#C3B2E3" },
  { name: "Meeting Notes.pdf", date: "May 3", color: "#F4DEDA" },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <FileTextOutlined />
        <strong>PDF Reader</strong>
      </div>

      <nav className="sidebar-nav">
        <Button type="primary" icon={<UploadOutlined />} className="sidebar-upload">
          Upload PDF
        </Button>
        <button className="sidebar-link active" type="button">
          <FolderOpenOutlined /> All Documents
        </button>
        <button className="sidebar-link" type="button">
          <ClockCircleOutlined /> Recent
        </button>
        <button className="sidebar-link" type="button">
          <StarOutlined /> Favorites
        </button>
        <button className="sidebar-link" type="button">
          <DeleteOutlined /> Trash
        </button>
      </nav>

      <div className="sidebar-recent">
        <span className="sidebar-section-title">Recent Files</span>
        {recentFiles.map((file) => (
          <div className="recent-file" key={file.name}>
            <span className="recent-dot" style={{ background: file.color }} />
            <div>
              <strong>{file.name}</strong>
              <small>{file.date}</small>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
