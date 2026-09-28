import { normalizeCurrency } from "../utils/normalizeCurrency"
import type { ExtractedInstallment } from "../models/extracted-pdf-result.model"

// Match labels without accents while preserving the original extracted values.
export function extractFinancialFields(text: string) {
  text = text.normalize("NFC")
  const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  function field(labels: string, value: string): string | undefined {
    const match = new RegExp(`(?:${labels})[ \\t]*[:：-]?[ \\t]*(?:\\r?\\n[ \\t]*)?(${value})`, "i").exec(normalized)
    if (!match) return undefined
    const start = match.index + match[0].length - match[1].length
    return text.normalize("NFC").slice(start, start + match[1].length).trim()
  }
  const date = "\\d{2}[/-]\\d{2}[/-]\\d{4}"
  const money = "(?:R\\$\\s*)?([0-9]+(?:\\.[0-9]{3})*,[0-9]{2})(?![0-9])"
  function amount(labels: string) {
    const value = field(labels, money)
    return value === undefined ? undefined : normalizeCurrency(value)
  }
  const issueDate = field("DATA (?:DE |DA )?EMISSAO|DATA (?:DO )?DOCUMENTO|EMISSAO", date)
  const installmentRows = [...normalized.matchAll(
    /\b(\d{1,3})\s+(\d{2}[/-]\d{2}[/-]\d{4})\s+(?:R\$\s*)?(\d+(?:\.\d{3})*,\d{2})(?!\d)/g,
  )]
  // A payment schedule can be repeated on multiple pages of the same PDF.
  const installmentMap = new Map<string, ExtractedInstallment>()
  for (const match of installmentRows) {
    if (Number(match[1]) === 0) continue
    const number = match[1].padStart(3, "0")
    installmentMap.set(number, {
      number,
      dueDate: match[2].replace(/-/g, "/"),
      amount: normalizeCurrency(match[3]),
    })
  }
  // Native Map does not survive JSON.stringify; persist a map keyed by installment number.
  const installments = Object.fromEntries(installmentMap)
  const [, emissionMonth, emissionYear] = issueDate?.split(/[/-]/).map(Number) ?? []
  const nextMonth = emissionMonth === 12 ? 1 : emissionMonth + 1
  const nextYear = emissionMonth === 12 ? emissionYear + 1 : emissionYear
  const nextInstallments = [...installmentMap.values()].filter(installment => {
    const [, month, year] = installment.dueDate.split("/").map(Number)
    return month === nextMonth && year === nextYear
  })
  const dueDate = nextInstallments.length === 1
    ? nextInstallments[0].dueDate
    : field("DATA (?:DE |DO )?VENCIMENTO|VENCIMENTO", date)
  return {
    issuerName: "hering",
    invoiceNumber: field("(?:N[º°o.]?\\s*(?:DA\\s*)?(?:NF(?:-E)?|NOTA FISCAL))|(?:NOTA FISCAL|NF-E)\\s*(?:N[º°o.]?)?", "[0-9][0-9./-]*")
      ?? field("\\bN[º°]\\s*\\.?", "[0-9]+(?:\\.[0-9]+)*"),
    installment: field("PARCELA", "[0-9]+(?:\\s*/\\s*[0-9]+)?"),
    installmentCount: installmentMap.size || undefined,
    installments,
    issueDate,
    dueDate,
    totalAmount: amount("VALOR TOTAL DA NOTA|VALOR (?:DO )?DOCUMENTO|VALOR (?:DO )?BOLETO|VALOR A PAGAR"),
    paidAmount: amount("VALOR PAGO"),
    paymentDate: dueDate,
    paymentStatus: "A pagar" as const,
    paymentMethod: field("FORMA (?:DE )?PAGAMENTO|MEIO (?:DE )?PAGAMENTO", "[^\\r\\n]+") || "Boleto",
  }
}
