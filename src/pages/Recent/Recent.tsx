import { DocumentGrid } from "../../components/DocumentGrid/DocumentGrid"
import type { ExtractedPdfResult } from "../../modules/pdf/models/extracted-pdf-result.model"
import "../Home/Home.styles.css"

type RecentProps = {
  documents: ExtractedPdfResult[]
  selectedDocumentId?: string
  onOpenDocument: (document: ExtractedPdfResult) => void
  onFavoriteToggle: (documentId: string) => void
  onTrashToggle: (document: ExtractedPdfResult) => void
}

export function Recent({
  documents,
  selectedDocumentId,
  onOpenDocument,
  onFavoriteToggle,
  onTrashToggle,
}: RecentProps) {
  return (
    <div className="view-page documents-page">
      <section className="documents-page__header">
        <h1>Documentos Recentes</h1>
        <p>Acesse rapidamente os PDFs lidos por Ãºltimo.</p>
      </section>

      <DocumentGrid
        documents={documents}
        selectedDocumentId={selectedDocumentId}
        emptyTitle="Nenhum PDF recente."
        emptyDescription="Os documentos lidos aparecerão aqui."
        onOpenDocument={onOpenDocument}
        onFavoriteToggle={onFavoriteToggle}
        onTrashToggle={onTrashToggle}
      />
    </div>
  )
}
