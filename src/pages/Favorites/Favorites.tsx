import { DocumentGrid } from "../../components/DocumentGrid/DocumentGrid"
import type { ExtractedPdfResult } from "../../modules/pdf/models/extracted-pdf-result.model"
import "../Home/Home.styles.css"

type FavoritesProps = {
  documents: ExtractedPdfResult[]
  selectedDocumentId?: string
  onOpenDocument: (document: ExtractedPdfResult) => void
  onFavoriteToggle: (documentId: string) => void
  onTrashToggle: (document: ExtractedPdfResult) => void
}

export function Favorites({
  documents,
  selectedDocumentId,
  onOpenDocument,
  onFavoriteToggle,
  onTrashToggle,
}: FavoritesProps) {
  return (
    <div className="view-page documents-page">
      <section className="documents-page__header">
        <h1>Favoritos</h1>
        <p>Documentos marcados para voltar depois.</p>
      </section>

      <DocumentGrid
        documents={documents}
        selectedDocumentId={selectedDocumentId}
        emptyTitle="Nenhum favorito ainda."
        emptyDescription="Marque um documento com estrela para ele aparecer aqui."
        onOpenDocument={onOpenDocument}
        onFavoriteToggle={onFavoriteToggle}
        onTrashToggle={onTrashToggle}
      />
    </div>
  )
}
