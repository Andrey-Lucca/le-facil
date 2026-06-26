import { Layout } from "antd"
import type { ReactNode } from "react"
import type { ExtractedPdfResult } from "../../modules/pdf/models/extracted-pdf-result.model"
import type { NavigationView } from "../../shared/types/navigation-view.type"
import { HeaderSearch } from "../HeaderSearch/HeaderSearch"
import { Sidebar } from "../Sidebar/Sidebar"
import "./AppLayout.styles.css"

type AppLayoutProps = {
  children: ReactNode
  searchValue: string
  documents: ExtractedPdfResult[]
  activeView: NavigationView
  selectedDocumentId?: string
  onSearchChange: (value: string) => void
  onViewChange: (view: NavigationView) => void
  onDocumentSelect: (document: ExtractedPdfResult) => void
}

export function AppLayout({
  children,
  searchValue,
  documents,
  activeView,
  selectedDocumentId,
  onSearchChange,
  onViewChange,
  onDocumentSelect,
}: AppLayoutProps) {
  return (
    <Layout className="app-shell">
      <Sidebar
        documents={documents}
        activeView={activeView}
        selectedDocumentId={selectedDocumentId}
        onViewChange={onViewChange}
        onDocumentSelect={onDocumentSelect}
      />
      <Layout className="app-main-layout">
        <HeaderSearch searchValue={searchValue} onSearchChange={onSearchChange} />
        <Layout.Content className="app-content">{children}</Layout.Content>
      </Layout>
    </Layout>
  )
}
