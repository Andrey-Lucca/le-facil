import {
  ClockCircleOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  RiseOutlined,
} from "@ant-design/icons"
import { Alert, App as AntApp, Progress, Spin } from "antd"
import { useMemo, useState } from "react"
import { AppLayout } from "../../components/Layout/AppLayout"
import { ExtractionTable } from "../../components/ExtractionTable/ExtractionTable"
import { PdfUploadArea } from "../../components/PdfUploadArea/PdfUploadArea"
import { SummaryCard } from "../../components/SummaryCard/SummaryCard"
import type { ExtractedPdfResult } from "../../modules/pdf/models/extracted-pdf-result.model"
import { extractPdf } from "../../modules/pdf/services/pdfExtractor.service"
import { loadSavedDocuments, saveDocument } from "../../modules/storage/services/localStorage.service"
import { themeTokens } from "../../shared/theme/themeTokens"

const readingItems = [
  { name: "Project Proposal.pdf", pages: "24 pages", progress: 75, color: themeTokens.accentOrange },
  { name: "Annual Report.pdf", pages: "156 pages", progress: 45, color: themeTokens.accentBlue },
  { name: "Research Paper.pdf", pages: "32 pages", progress: 100, color: themeTokens.accentPurple },
  { name: "Meeting Notes.pdf", pages: "8 pages", progress: 30, color: themeTokens.accentPink },
]

export function Home() {
  const { message } = AntApp.useApp()
  const [searchValue, setSearchValue] = useState("")
  const [documents, setDocuments] = useState<ExtractedPdfResult[]>(() => loadSavedDocuments())
  const [selectedResult, setSelectedResult] = useState<ExtractedPdfResult | undefined>(documents[0])
  const [isReading, setIsReading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => document.fileName.toLowerCase().includes(searchValue.toLowerCase()))
  }, [documents, searchValue])

  async function handleFileSelected(file: File) {
    setIsReading(true)
    setErrorMessage("")

    try {
      const result = await extractPdf(file)
      const updatedDocuments = saveDocument(result)
      setDocuments(updatedDocuments)
      setSelectedResult(result)
      message.success("PDF read successfully")
    } catch (error) {
      const safeMessage = error instanceof Error ? error.message : "Could not read this PDF"
      setErrorMessage(safeMessage)
      message.error("PDF reading failed")
    } finally {
      setIsReading(false)
    }
  }

  return (
    <AppLayout searchValue={searchValue} onSearchChange={setSearchValue}>
      <section className="hero-copy">
        <h1>Welcome back</h1>
        <p>Continue reading or extract fiscal data from DANFE/NF-e PDFs.</p>
      </section>

      <section className="summary-grid">
        <SummaryCard icon={<FileTextOutlined />} label="Total Documents" value={String(documents.length)} color={themeTokens.accentOrange} />
        <SummaryCard icon={<ClockCircleOutlined />} label="Reading Time" value="12h" color={themeTokens.accentBlue} />
        <SummaryCard icon={<FileDoneOutlined />} label="Extracted Files" value={String(documents.filter((doc) => doc.items.length > 0).length)} color={themeTokens.accentPurple} />
        <SummaryCard icon={<RiseOutlined />} label="This Week" value={String(documents.length)} color={themeTokens.accentPink} />
      </section>

      <section className="dashboard-grid">
        <div>
          <h2 className="section-title">Continue Reading</h2>
          <div className="reading-grid">
            {readingItems.map((item) => (
              <article className="reading-card" key={item.name}>
                <span className="reading-icon" style={{ background: item.color }}>
                  <FileTextOutlined />
                </span>
                <div className="reading-content">
                  <strong>{item.name}</strong>
                  <span>{item.pages}</span>
                  <small>Progress</small>
                  <Progress percent={item.progress} showInfo={false} strokeColor={item.color} trailColor="#F1EBDD" />
                </div>
                <span className="reading-percent">{item.progress}%</span>
              </article>
            ))}
          </div>
        </div>

        <aside className="documents-panel">
          <h2 className="section-title">Recent extractions</h2>
          {filteredDocuments.length === 0 ? (
            <p className="empty-state">No extracted PDFs yet.</p>
          ) : (
            filteredDocuments.slice(0, 6).map((document) => (
              <button className="document-row" type="button" key={document.id} onClick={() => setSelectedResult(document)}>
                <strong>{document.fileName}</strong>
                <span>{document.documentType} Â· {document.items.length} items</span>
              </button>
            ))
          )}
        </aside>
      </section>

      {errorMessage ? <Alert type="error" showIcon message={errorMessage} className="read-alert" /> : null}

      <Spin spinning={isReading} tip="Reading PDF...">
        <PdfUploadArea loading={isReading} onFileSelected={handleFileSelected} />
      </Spin>

      <ExtractionTable result={selectedResult} />
    </AppLayout>
  )
}
