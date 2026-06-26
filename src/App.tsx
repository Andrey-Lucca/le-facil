import { App as AntApp, ConfigProvider, Skeleton } from "antd"
import { useEffect, useMemo, useRef, useState } from "react"
import { AppLayout } from "./components/Layout/AppLayout"
import type { ExtractedPdfResult } from "./modules/pdf/models/extracted-pdf-result.model"
import { extractPdf } from "./modules/pdf/services/pdfExtractor.service"
import {
  getDocumentsStorePath,
  loadSavedDocuments,
  moveDocumentToTrash,
  restoreDocumentFromTrash,
  saveDocument,
  toggleDocumentFavorite,
} from "./modules/storage/services/localStorage.service"
import { ExtractionResult } from "./pages/ExtractionResult/ExtractionResult"
import { Favorites } from "./pages/Favorites/Favorites"
import { Home } from "./pages/Home"
import { Recent } from "./pages/Recent/Recent"
import { Trash } from "./pages/Trash/Trash"
import { UploadPdf } from "./pages/UploadPdf/UploadPdf"
import { themeTokens } from "./shared/theme/themeTokens"
import type { NavigationView } from "./shared/types/navigation-view.type"
import "./App.css"

function App() {
  const { message } = AntApp.useApp()
  const [searchValue, setSearchValue] = useState("")
  const [activeView, setActiveView] = useState<NavigationView>("all")
  const [documents, setDocuments] = useState<ExtractedPdfResult[]>([])
  const [selectedResult, setSelectedResult] = useState<ExtractedPdfResult>()
  const [storagePath, setStoragePath] = useState("")
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true)
  const [isReading, setIsReading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let isMounted = true

    async function hydrateDocuments() {
      try {
        const [savedDocuments, documentsStorePath] = await Promise.all([
          loadSavedDocuments(),
          getDocumentsStorePath(),
        ])

        if (!isMounted) {
          return
        }

        setDocuments(savedDocuments)
        setSelectedResult(savedDocuments.find((document) => !document.deleted))
        setStoragePath(documentsStorePath)
      } catch (error) {
        const safeMessage = error instanceof Error ? error.message : "Could not load saved documents"
        setErrorMessage(safeMessage)
      } finally {
        if (isMounted) {
          setIsLoadingDocuments(false)
        }
      }
    }

    void hydrateDocuments()

    return () => {
      isMounted = false
    }
  }, [])

  const visibleDocuments = useMemo(() => {
    const byView = documents.filter((document) => {
      if (activeView === "trash") {
        return document.deleted
      }

      if (document.deleted) {
        return false
      }

      if (activeView === "favorites") {
        return document.favorite
      }

      return true
    })

    return byView.filter((document) => {
      const searchableText = [
        document.fileName,
        document.documentType,
        document.accessKey,
        document.issuerName,
        document.recipientName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return searchableText.includes(searchValue.toLowerCase())
    })
  }, [activeView, documents, searchValue])

  function openDocument(document: ExtractedPdfResult) {
    setSelectedResult(document)
    setActiveView("results")
  }

  function refreshSelectedDocument(updatedDocuments: ExtractedPdfResult[], documentId?: string) {
    const currentDocumentId = documentId ?? selectedResult?.id
    const updatedSelectedDocument = updatedDocuments.find((document) => document.id === currentDocumentId)
    setSelectedResult(updatedSelectedDocument?.deleted ? undefined : updatedSelectedDocument)
  }

  async function handleFileSelected(file: File) {
    if (file.type && file.type !== "application/pdf") {
      setErrorMessage("Please select a PDF file.")
      return
    }

    setIsReading(true)
    setErrorMessage("")

    try {
      const result = await extractPdf(file)
      const updatedDocuments = await saveDocument(result)
      setDocuments(updatedDocuments)
      setSelectedResult(result)
      setActiveView("results")

      if (result.status === "success") {
        message.success(`PDF read: ${result.items.length} product items found`)
      } else if (result.status === "partial") {
        message.warning("PDF read partially. Text was extracted, but product rows need review.")
      } else {
        message.error("PDF text could not be extracted.")
      }
    } catch (error) {
      const safeMessage = error instanceof Error ? error.message : "Could not read this PDF"
      setErrorMessage(safeMessage)
      message.error("PDF reading failed")
    } finally {
      setIsReading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  function handleNativeInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      void handleFileSelected(selectedFile)
    }
  }

  async function handleFavoriteToggle(documentId: string) {
    const updatedDocuments = await toggleDocumentFavorite(documentId)
    setDocuments(updatedDocuments)
    refreshSelectedDocument(updatedDocuments, documentId)
  }

  async function handleTrashToggle(document: ExtractedPdfResult) {
    const updatedDocuments = document.deleted
      ? await restoreDocumentFromTrash(document.id)
      : await moveDocumentToTrash(document.id)

    setDocuments(updatedDocuments)
    refreshSelectedDocument(updatedDocuments, document.id)

    if (!document.deleted && selectedResult?.id === document.id) {
      setActiveView("all")
    }
  }

  function renderPage() {
    if (isLoadingDocuments) {
      return <Skeleton active paragraph={{ rows: 6 }} />
    }

    const sharedDocumentProps = {
      selectedDocumentId: selectedResult?.id,
      onOpenDocument: openDocument,
      onFavoriteToggle: (documentId: string) => void handleFavoriteToggle(documentId),
      onTrashToggle: (document: ExtractedPdfResult) => void handleTrashToggle(document),
    }

    if (activeView === "upload") {
      return (
        <UploadPdf
          documents={documents}
          errorMessage={errorMessage}
          isReading={isReading}
          onFileSelected={handleFileSelected}
        />
      )
    }

    if (activeView === "results") {
      return (
        <ExtractionResult
          result={selectedResult}
          storagePath={storagePath}
          onUploadClick={() => setActiveView("upload")}
          onFavoriteToggle={(documentId) => void handleFavoriteToggle(documentId)}
          onTrashToggle={(document) => void handleTrashToggle(document)}
        />
      )
    }

    if (activeView === "recent") {
      return <Recent documents={visibleDocuments} {...sharedDocumentProps} />
    }

    if (activeView === "favorites") {
      return <Favorites documents={visibleDocuments} {...sharedDocumentProps} />
    }

    if (activeView === "trash") {
      return <Trash documents={visibleDocuments} {...sharedDocumentProps} />
    }

    return <Home documents={visibleDocuments} {...sharedDocumentProps} />
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: themeTokens.textPrimary,
          colorBgBase: themeTokens.background,
          colorText: themeTokens.textPrimary,
          colorTextSecondary: themeTokens.textSecondary,
          colorBorder: themeTokens.border,
          borderRadius: 8,
          fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        },
      }}
    >
      <AntApp>
        <AppLayout
          searchValue={searchValue}
          documents={documents}
          activeView={activeView}
          selectedDocumentId={selectedResult?.id}
          onSearchChange={setSearchValue}
          onViewChange={setActiveView}
          onDocumentSelect={openDocument}
        >
          <input
            ref={fileInputRef}
            className="native-file-input"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleNativeInputChange}
          />
          {renderPage()}
        </AppLayout>
      </AntApp>
    </ConfigProvider>
  )
}

export default App
