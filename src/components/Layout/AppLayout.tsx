import { Layout } from "antd"
import type { ReactNode } from "react"
import type { ExtractedPdfResult } from "../../modules/pdf/models/extracted-pdf-result.model"
import { HeaderSearch } from "../HeaderSearch/HeaderSearch"
import { Sidebar } from "../Sidebar/Sidebar"
import "./AppLayout.styles.css"

type AppLayoutProps = {
  children: ReactNode
  searchValue: string
  documents: ExtractedPdfResult[]
  selectedDocumentId?: string
  onSearchChange: (value: string) => void
  onDocumentSelect: (document: ExtractedPdfResult) => void
}

export function AppLayout({
  children,
  searchValue,
  documents,
  selectedDocumentId,
  onSearchChange,
  onDocumentSelect,
}: AppLayoutProps) {
  return (
    <Layout className="app-shell">
      <Sidebar
        documents={documents}
        selectedDocumentId={selectedDocumentId}
        onDocumentSelect={onDocumentSelect}
      />
      <Layout className="app-main-layout">
        <HeaderSearch searchValue={searchValue} onSearchChange={onSearchChange} />
        <Layout.Content className="app-content">{children}</Layout.Content>
      </Layout>
    </Layout>
  )
}
