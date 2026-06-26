export function normalizeNumber(value?: string): number {
  if (!value) {
    return 0
  }

  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".")

  const numberValue = Number(normalized)
  return Number.isFinite(numberValue) ? numberValue : 0
}
