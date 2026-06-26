import { DocumentGrid } from "../../components/DocumentGrid/DocumentGrid"
import type { ExtractedPdfResult } from "../../modules/pdf/models/extracted-pdf-result.model"
import "../Home/Home.styles.css"

type TrashProps = {
  documents: ExtractedPdfResult[]
  selectedDocumentId?: string
  onOpenDocument: (document: ExtractedPdfResult) => void
  onFavoriteToggle: (documentId: string) => void
  onTrashToggle: (document: ExtractedPdfResult) => void
}

export function Trash({
  documents,
  selectedDocumentId,
  onOpenDocument,
  onFavoriteToggle,
  onTrashToggle,
}: TrashProps) {
  return (
    <div className="view-page documents-page">
      <section className="documents-page__header">
        <h1>Lixeira</h1>
        <p>Documentos removidos ficam aqui para restauração.</p>
      </section>

      <DocumentGrid
        documents={documents}
        selectedDocumentId={selectedDocumentId}
        emptyTitle="A lixeira está vazia."
        emptyDescription="Documentos enviados para a lixeira aparecerão aqui."
        onOpenDocument={onOpenDocument}
        onFavoriteToggle={onFavoriteToggle}
        onTrashToggle={onTrashToggle}
      />
    </div>
  )
}
