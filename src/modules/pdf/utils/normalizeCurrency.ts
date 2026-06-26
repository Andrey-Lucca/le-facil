import { normalizeNumber } from "./normalizeNumber"

export function normalizeCurrency(value?: string): number {
  return normalizeNumber(value)
}
