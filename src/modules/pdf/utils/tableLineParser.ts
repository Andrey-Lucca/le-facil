import type { ExtractedProductItem } from "../models/extracted-product-item.model"
import { normalizeCurrency } from "./normalizeCurrency"
import { normalizeNumber } from "./normalizeNumber"

const NUMBER_PATTERN = String.raw`[-+]?\d{1,3}(?:\.\d{3})*,\d+|[-+]?\d+,\d+|[-+]?\d+`
const CNPJ_PATTERN = /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/
const HEADER_PATTERN = /COD\.?PROD|DESCRI|PRODUTOS|SERVICOS|VALOR\s+UNIT/i
const MONEY_PATTERN = /\bR\$\s*\d/i
const TEXT_PATTERN = /\p{L}/u
const PRODUCT_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9./_-]{1,29}$/


function isDefinitelyNotProductLine(line: string): boolean {
  return (
    !line ||
    HEADER_PATTERN.test(line) ||
    CNPJ_PATTERN.test(line) ||
    MONEY_PATTERN.test(line)
  )
}

export function parseInvoiceProductLine(line: string): ExtractedProductItem | null {
  const compactLine = line.replace(/\s+/g, " ").trim()

  if (isDefinitelyNotProductLine(compactLine)) {
    return null
  }

  const tokens = compactLine.split(" ")
  const productCode = tokens.shift() ?? ""

  if (!PRODUCT_CODE_PATTERN.test(productCode) || CNPJ_PATTERN.test(productCode)) {
    return null
  }

  const numericMatches = [...compactLine.matchAll(new RegExp(NUMBER_PATTERN, "g"))]
  if (numericMatches.length < 8) {
    return null
  }

  const trailingValues = numericMatches.slice(-8).map((match) => match[0])
  const firstTrailingValue = numericMatches[numericMatches.length - 8]
  const detailText = compactLine.slice(productCode.length, firstTrailingValue.index).trim()
  const detailTokens = detailText.split(" ").filter(Boolean)

  if (!TEXT_PATTERN.test(detailText) || detailTokens.length < 2) {
    return null
  }

  const cfopIndex = detailTokens.findIndex((token) => /^\d{4}$/.test(token))
  const ncmIndex = detailTokens.findIndex((token) => /^\d{7,8}$/.test(token))
  const cstIndex = detailTokens.findIndex((token) => /^\d{2,3}$/.test(token))
  const ceanIndex = detailTokens.findIndex((token) => /^\d{8,14}$/.test(token))

  const unit = cfopIndex >= 0 ? detailTokens[cfopIndex + 1] ?? "" : ""
  const orderNumber = detailTokens.find((token) => /^P?E?D?\d{3,}$/i.test(token)) ?? ""
  const descriptionLimit = [ceanIndex, ncmIndex, cstIndex, cfopIndex]
    .filter((index) => index > 0)
    .sort((a, b) => a - b)[0] ?? detailTokens.length
  const description = detailTokens.slice(0, descriptionLimit).join(" ").trim()

  if (!TEXT_PATTERN.test(description)) {
    return null
  }

  return {
    productCode,
    description,
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



