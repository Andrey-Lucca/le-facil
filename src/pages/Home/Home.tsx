import { DocumentGrid } from "../../components/DocumentGrid/DocumentGrid"
import type { ExtractedPdfResult } from "../../modules/pdf/models/extracted-pdf-result.model"
import "./Home.styles.css"

type HomeProps = {
  documents: ExtractedPdfResult[]
  selectedDocumentId?: string
  onOpenDocument: (document: ExtractedPdfResult) => void
  onFavoriteToggle: (documentId: string) => void
  onTrashToggle: (document: ExtractedPdfResult) => void
}

export function Home({
  documents,
  selectedDocumentId,
  onOpenDocument,
  onFavoriteToggle,
  onTrashToggle,
}: HomeProps) {
  return (
    <div className="view-page documents-page">
      <section className="documents-page__header">
        <h1>Documentos</h1>
        <p>Gerencie seus PDFs salvos e abra os resultados da extração.</p>
      </section>

      <DocumentGrid
        documents={documents}
        selectedDocumentId={selectedDocumentId}
        emptyTitle="Nenhum PDF aqui ainda."
        emptyDescription='Use o botão "Upload PDF" para adicionar e ler um documento.'
        onOpenDocument={onOpenDocument}
        onFavoriteToggle={onFavoriteToggle}
        onTrashToggle={onTrashToggle}
      />
    </div>
  )
}
