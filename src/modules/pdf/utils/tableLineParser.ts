import type { ExtractedProductItem } from "../models/extracted-product-item.model"
import { normalizeCurrency } from "./normalizeCurrency"
import { normalizeNumber } from "./normalizeNumber"

const NUMBER_PATTERN = String.raw`[-+]?\d{1,3}(?:\.\d{3})*,\d+|[-+]?\d+,\d+|[-+]?\d+`

export function parseInvoiceProductLine(line: string): ExtractedProductItem | null {
  const compactLine = line.replace(/\s+/g, " ").trim()

  if (!compactLine || /C[OÃ“]D\.?PROD|DESCRI[CÃ‡][AÃƒ]O|VALOR\s+UNIT/i.test(compactLine)) {
    return null
  }

  const tokens = compactLine.split(" ")
  const productCode = tokens.shift() ?? ""

  if (!/\d/.test(productCode)) {
    return null
  }

  const numericMatches = [...compactLine.matchAll(new RegExp(NUMBER_PATTERN, "g"))]
  if (numericMatches.length < 8) {
    return null
  }

  const trailingValues = numericMatches.slice(-8).map((match) => match[0])
  const firstTrailingValue = numericMatches[numericMatches.length - 8]
  const descriptionEndIndex = Math.max(firstTrailingValue.index - productCode.length, 0)
  const detailText = compactLine.slice(productCode.length, firstTrailingValue.index).trim()
  const detailTokens = detailText.split(" ").filter(Boolean)

  const cfopIndex = detailTokens.findIndex((token) => /^\d{4}$/.test(token))
  const ncmIndex = detailTokens.findIndex((token) => /^\d{8}$/.test(token))
  const cstIndex = detailTokens.findIndex((token) => /^\d{2,3}$/.test(token))
  const ceanIndex = detailTokens.findIndex((token) => /^\d{8,14}$/.test(token))

  const unit = cfopIndex >= 0 ? detailTokens[cfopIndex + 1] ?? "" : ""
  const orderNumber = detailTokens.find((token) => /^P?E?D?\d{3,}$/i.test(token)) ?? ""
  const descriptionLimit = [ceanIndex, ncmIndex, cstIndex, cfopIndex]
    .filter((index) => index > 0)
    .sort((a, b) => a - b)[0] ?? detailTokens.length
  const description = detailTokens.slice(0, descriptionLimit).join(" ")

  return {
    productCode,
    description: description.slice(0, descriptionEndIndex).trim() || detailText,
    orderNumber,
    cean: ceanIndex >= 0 ? detailTokens[ceanIndex] : "",
    ncmSh: ncmIndex >= 0 ? detailTokens[ncmIndex] : "",
    cst: cstIndex >= 0 ? detailTokens[cstIndex] : "",
    cfop: cfopIndex >= 0 ? detailTokens[cfopIndex] : "",
    unit,
    quantity: normalizeNumber(trailingValues[0]),
    unitValue: normalizeCurrency(trailingValues[1]),
    totalValue: normalizeCurrency(trailingValues[2]),
    icmsBaseValue: normalizeCurrency(trailingValues[3]),
    icmsValue: normalizeCurrency(trailingValues[4]),
    ipiValue: normalizeCurrency(trailingValues[5]),
    icmsRate: normalizeNumber(trailingValues[6]),
    ipiRate: normalizeNumber(trailingValues[7]),
  }
}
