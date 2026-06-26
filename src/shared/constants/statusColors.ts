import type { ExtractionStatus } from "../../modules/pdf/models/extracted-pdf-result.model"

export const statusColors: Record<ExtractionStatus, string> = {
  success: "green",
  partial: "gold",
  failed: "red",
}
