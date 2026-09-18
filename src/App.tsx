import { App as AntApp, ConfigProvider, Modal, Skeleton } from "antd"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom"
import { AppLayout } from "./components/Layout/AppLayout"
import type { ExtractedPdfResult } from "./modules/pdf/models/extracted-pdf-result.model"
import { extractPdf } from "./modules/pdf/services/pdfExtractor.service"
import {
  getDocumentsStorePath,
  loadSavedDocuments,
  deleteDocument,
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
import "./App.css"
import { Config } from "./pages/Configs"

type ConfirmAction =
  | { type: "trash"; document: ExtractedPdfResult }
  | { type: "restore"; documentId: string }
  | { type: "delete"; documentId: string }

function AppContent() {
  const { message } = AntApp.useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState("")
  const [documents, setDocuments] = useState<ExtractedPdfResult[]>([])
  const [selectedResult, setSelectedResult] = useState<ExtractedPdfResult>()
  const [storagePath, setStoragePath] = useState("")
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true)
  const [isReading, setIsReading] = useState(false)
  const [isConfirm, setIsConfirm] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>()
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
        const safeMessage =
          error instanceof Error
            ? error.message
            : "Could not load saved documents"
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
      if (location.pathname === "/trash") {
        return document.deleted
      }

      if (document.deleted) {
        return false
      }

      if (location.pathname === "/favorites") {
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
  }, [documents, location.pathname, searchValue])

  function openDocument(document: ExtractedPdfResult) {
    setSelectedResult(document)
    navigate("/results")
  }

  function refreshSelectedDocument(
    updatedDocuments: ExtractedPdfResult[],
    documentId?: string,
  ) {
    const currentDocumentId = documentId ?? selectedResult?.id
    const updatedSelectedDocument = updatedDocuments.find(
      (document) => document.id === currentDocumentId,
    )
    setSelectedResult(
      updatedSelectedDocument?.deleted ? undefined : updatedSelectedDocument,
    )
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
      navigate("/results")

      if (result.status === "success") {
        message.success(`PDF read: ${result.items.length} product items found`)
      } else if (result.status === "partial") {
        message.warning(
          "PDF read partially. Text was extracted, but product rows need review.",
        )
      } else {
        message.error("PDF text could not be extracted.")
      }
    } catch (error) {
      const safeMessage =
        error instanceof Error ? error.message : "Could not read this PDF"
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
    const updatedDocuments = await moveDocumentToTrash(document.id)

    setDocuments(updatedDocuments)
    refreshSelectedDocument(updatedDocuments, document.id)

    if (selectedResult?.id === document.id) {
      navigate("/")
    }
  }

  async function handleRestoreDocument(documentId: string) {
    const updatedDocuments = await restoreDocumentFromTrash(documentId)

    setDocuments(updatedDocuments)
    refreshSelectedDocument(updatedDocuments, documentId)
    navigate("/")
  }

  async function handleDeleteDocument(documentId: string) {
    const updatedDocuments = await deleteDocument(documentId)

    setDocuments(updatedDocuments)

    if (selectedResult?.id === documentId) {
      setSelectedResult(updatedDocuments.find((document) => !document.deleted))
      navigate("/trash")
    }
  }

  function requestTrashDocument(document: ExtractedPdfResult) {
    setConfirmAction({ type: "trash", document })
    setIsConfirm(true)
  }

  function requestRestoreDocument(documentId: string) {
    setConfirmAction({ type: "restore", documentId })
    setIsConfirm(true)
  }

  function requestDeleteDocument(documentId: string) {
    setConfirmAction({ type: "delete", documentId })
    setIsConfirm(true)
  }

  function closeConfirm() {
    setIsConfirm(false)
    setConfirmAction(undefined)
  }

  async function handleConfirmAction() {
    if (!confirmAction) {
      return
    }

    if (confirmAction.type === "trash") {
      await handleTrashToggle(confirmAction.document)
    }

    if (confirmAction.type === "restore") {
      await handleRestoreDocument(confirmAction.documentId)
    }

    if (confirmAction.type === "delete") {
      await handleDeleteDocument(confirmAction.documentId)
    }

    closeConfirm()
  }

  function getConfirmTitle() {
    if (confirmAction?.type === "trash") {
      return "Mover documento para a lixeira?"
    }

    if (confirmAction?.type === "restore") {
      return "Restaurar documento?"
    }

    return "Excluir documento definitivamente?"
  }

  function getConfirmDescription() {
    if (confirmAction?.type === "trash") {
      return "O documento sairá da lista principal e ficará disponível na lixeira."
    }

    if (confirmAction?.type === "restore") {
      return "O documento voltará para a lista principal."
    }

    return "Essa ação remove o documento salvo e não poderá ser desfeita."
  }

  function renderRoutes() {
    const sharedDocumentProps = {
      selectedDocumentId: selectedResult?.id,
      onOpenDocument: openDocument,
      onFavoriteToggle: (documentId: string) =>
        void handleFavoriteToggle(documentId),
      onTrashToggle: requestTrashDocument,
    }

    return (
      <Routes>
        <Route
          path="/"
          element={
            <Home documents={visibleDocuments} {...sharedDocumentProps} />
          }
        />
        <Route
          path="/recent"
          element={
            <Recent documents={visibleDocuments} {...sharedDocumentProps} />
          }
        />
        <Route
          path="/favorites"
          element={
            <Favorites documents={visibleDocuments} {...sharedDocumentProps} />
          }
        />
        <Route
          path="/trash"
          element={
            <Trash
              documents={visibleDocuments}
              {...sharedDocumentProps}
              onRestore={requestRestoreDocument}
              onDelete={requestDeleteDocument}
            />
          }
        />
        <Route
          path="/upload"
          element={
            <UploadPdf
              documents={documents}
              errorMessage={errorMessage}
              isReading={isReading}
              onFileSelected={handleFileSelected}
            />
          }
        />
        <Route
          path="/results"
          element={
            <ExtractionResult
              result={selectedResult}
              storagePath={storagePath}
              onUploadClick={() => navigate("/upload")}
              onFavoriteToggle={(documentId) =>
                void handleFavoriteToggle(documentId)
              }
              onTrashToggle={requestTrashDocument}
            />
          }
        />
        <Route path="/config" element={<Config />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <>
      <AppLayout
        searchValue={searchValue}
        documents={documents}
        selectedDocumentId={selectedResult?.id}
        onSearchChange={setSearchValue}
        onDocumentSelect={openDocument}
      >
        <input
          ref={fileInputRef}
          className="native-file-input"
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleNativeInputChange}
        />
        {isLoadingDocuments ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          renderRoutes()
        )}
      </AppLayout>

      <Modal
        open={isConfirm}
        title={getConfirmTitle()}
        okText="Confirmar"
        cancelText="Cancelar"
        okButtonProps={{
          danger:
            confirmAction?.type === "delete" ||
            confirmAction?.type === "trash",
        }}
        onOk={() => void handleConfirmAction()}
        onCancel={closeConfirm}
      >
        <p>{getConfirmDescription()}</p>
      </Modal>
    </>
  )
}

function App() {
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
          fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        },
      }}
    >
      <AntApp>
        <AppContent />
      </AntApp>
    </ConfigProvider>
  )
}

export default App
