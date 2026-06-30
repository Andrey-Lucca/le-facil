import { DocumentGrid } from "../../components/DocumentGrid/DocumentGrid"
import type { ExtractedPdfResult } from "../../modules/pdf/models/extracted-pdf-result.model"
import "../Home/Home.styles.css"

type TrashProps = {
  documents: ExtractedPdfResult[]
  selectedDocumentId?: string
  onOpenDocument: (document: ExtractedPdfResult) => void
  onFavoriteToggle: (documentId: string) => void
  onRestore: (documentId: string) => void
  onDelete: (documentId: string) => void
}

export function Trash({
  documents,
  selectedDocumentId,
  onOpenDocument,
  onFavoriteToggle,
  onRestore,
  onDelete,
}: TrashProps) {
  return (
    <div className="view-page documents-page">
      <section className="documents-page__header">
        <h1>Lixeira</h1>
        <p>Restaure documentos removidos ou exclua definitivamente.</p>
      </section>

      <DocumentGrid
        documents={documents}
        selectedDocumentId={selectedDocumentId}
        emptyTitle="A lixeira esta vazia."
        emptyDescription="Documentos enviados para a lixeira aparecerao aqui."
        onOpenDocument={onOpenDocument}
        onFavoriteToggle={onFavoriteToggle}
        onRestore={onRestore}
        onDelete={onDelete}
      />
    </div>
  )
}
