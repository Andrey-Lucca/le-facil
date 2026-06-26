import type { ExtractedPdfResult } from "../../pdf/models/extracted-pdf-result.model"

export interface SavedDocument extends ExtractedPdfResult {
  favorite?: boolean
  deleted?: boolean
}
