import type { ExtractedProductItem } from "../models/extracted-product-item.model"
import { normalizeCurrency } from "./normalizeCurrency"
import { normalizeNumber } from "./normalizeNumber"

const NUMBER_PATTERN = /^[-+]?(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)?$/
const FISCAL_COLUMNS_PATTERN = /^(.*?)\s+(\d{7,8})\s+(\d{2,3})\s+([1-7]\d{3})\s+([\p{L}][\p{L}\d./_-]*)\s+(.+)$/u
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

  const fiscalColumns = tokens.join(" ").match(FISCAL_COLUMNS_PATTERN)
  if (!fiscalColumns) {
    return null
  }

  const [, detailText, ncmSh, cst, cfop, unit, valuesText] = fiscalColumns
  const trailingValues = valuesText.split(" ")

  // Read quantity and prices after the fiscal columns, never from numbers in the description.
  if (
    trailingValues.length < 3 ||
    trailingValues.length > 8 ||
    !trailingValues.every(value => NUMBER_PATTERN.test(value))
  ) {
    return null
  }

  const detailTokens = detailText.trim().split(" ")
  const ceanIndex = detailTokens.findIndex((token) => /^(?:\d{8}|\d{12,14})$/.test(token))
  const orderIndex = detailTokens.findIndex((token) => /^PED\d+$/i.test(token))
  const orderNumber = orderIndex >= 0 ? detailTokens[orderIndex] : ""
  const descriptionLimit = [ceanIndex, orderIndex]
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
    ncmSh,
    cst,
    cfop,
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



