import { DeleteOutlined } from "@ant-design/icons"
import { App as AntApp, Button, Descriptions, Empty, Space } from "antd"
import { useState } from "react"
import { ExtractionTable } from "../../components/ExtractionTable/ExtractionTable"
import type { ExtractedPdfResult } from "../../modules/pdf/models/extracted-pdf-result.model"
import { formatFileSize } from "../../shared/utils/formatFileSize"
import "./ExtractionResult.styles.css"
import type { SearchResponse } from "../../../electron/ipc/search-engine.handler"

type ExtractionResultProps = {
  result?: ExtractedPdfResult
  storagePath: string
  onUploadClick: () => void
  onFavoriteToggle: (documentId: string) => void
  onTrashToggle: (document: ExtractedPdfResult) => void
}

export function ExtractionResult({
  result,
  storagePath,
  onUploadClick,
  onTrashToggle,
}: ExtractionResultProps) {
  const { message } = AntApp.useApp()
  const [searching, setSearching] = useState(false)

  if (!result) {
    return (
      <div className="view-page view-page-centered">
        <Empty description="Selecione um PDF recente ou faÃ§a o upload de um novo para ver os resultados da extraÃ§Ã£o." />
        <Button type="primary" onClick={onUploadClick}>
          Ler PDF
        </Button>
      </div>
    )
  }

  async function searchPrices(id: string): Promise<void> {
    setSearching(true)

    try {
      const searchResponse: SearchResponse = await window.ipcRenderer.invoke(
        "search-engine:run",
        id,
      )

      if (searchResponse.success) {
        message.success(searchResponse.message)
      } else {
        message.error(searchResponse.message)
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Erro ao executar a automação.")
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="view-page results-screen">
      <div className="results-content">
        <div className="workspace-title-row">
          <div className="workspace-title">
            <h1>{result.fileName}</h1>
            <p>{result.items.length} itens extraídos</p>
          </div>
          <Space>
            <Button type="primary" loading={searching} onClick={() => searchPrices(result.id)}>Buscar preços</Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => onTrashToggle(result)}
            />
          </Space>
        </div>
        <ExtractionTable result={result} />
      </div>

      <aside className="documents-panel document-details-panel">
        <h2 className="section-title">Detalhes do documento</h2>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Tipo">
            {result.documentType}
          </Descriptions.Item>
          <Descriptions.Item label="Páginas">
            {result.pageCount}
          </Descriptions.Item>
          <Descriptions.Item label="Tamanho do arquivo">
            {formatFileSize(result.fileSize)}
          </Descriptions.Item>
          <Descriptions.Item label="Produtos">
            {result.items.length}
          </Descriptions.Item>
          {result.issueDate ? (
            <Descriptions.Item label="Data de emissão">
              {result.issueDate}
            </Descriptions.Item>
          ) : null}
          {result.accessKey ? (
            <Descriptions.Item label="Chave de acesso">
              {result.accessKey}
            </Descriptions.Item>
          ) : null}
        </Descriptions>
        <div className="storage-note">
          <strong>Salvo em</strong>
          <span>{storagePath || "Dados do usuário do Electron"}</span>
        </div>
      </aside>
    </div>
  )
}
