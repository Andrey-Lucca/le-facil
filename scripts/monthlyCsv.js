import { mkdir, open, readFile, writeFile, rename, copyFile } from "node:fs/promises"
import { join } from "node:path"

function csvValue(value) {
  const text = String(value ?? "")
  return /[\t\r\n"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

// Add empty columns at record boundaries without modifying quoted multiline cells.
function extendRecords(content, columnCount) {
  let quoted = false
  let output = ""
  const padding = "\t".repeat(columnCount)
  for (let index = 0; index < content.length; index++) {
    const character = content[index]
    if (character === '"') {
      if (quoted && content[index + 1] === '"') {
        output += '""'
        index++
        continue
      }
      quoted = !quoted
    }
    if (!quoted && (character === '\r' || character === '\n')) {
      output += padding + '\r\n'
      if (character === '\r' && content[index + 1] === '\n') index++
    } else {
      output += character
    }
  }
  if (quoted) throw new Error("O CSV existente contém aspas não fechadas.")
  if (content && !/[\r\n]$/.test(content)) output += padding + '\r\n'
  return output
}

export async function appendMonthlyCsv(folder, prefix, headers, rows, date = new Date(), legacyHeaders) {
  await mkdir(folder, { recursive: true })
  const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
  const path = join(folder, `${prefix}-${month}.csv`)
  // Exclusive lock prevents simultaneous exports from duplicating the header.
  const lock = await open(`${path}.lock`, "wx").catch(error => {
    if (error.code === "EEXIST") throw new Error("Há uma exportação em andamento para este mês. Tente novamente.")
    throw error
  })
  try {
    if (legacyHeaders) {
      const existing = await readFile(path, "utf8").catch(error => {
        if (error.code === "ENOENT") return ""
        throw error
      })
      const withoutBom = existing.replace(/^\uFEFF/, "")
      const oldHeader = legacyHeaders.map(csvValue).join("\t")
      if (withoutBom.split(/\r?\n/, 1)[0] === oldHeader) {
        const body = withoutBom.slice(oldHeader.length).replace(/^\r?\n/, "")
        const migrated = `\uFEFF${headers.map(csvValue).join("\t")}\r\n` + extendRecords(body, headers.length - legacyHeaders.length)
        await copyFile(path, `${path}.before-products.bak`)
        await writeFile(`${path}.tmp`, migrated, "utf8")
        await rename(`${path}.tmp`, path)
      }
    }
    const file = await open(path, "a+")
    try {
      const existing = await file.readFile("utf8")
      const header = headers.map(csvValue).join("\t")
      if (existing && existing.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0] !== header) {
        throw new Error(`O cabeçalho de ${path} não corresponde ao formato esperado.`)
      }
      const start = existing ? (/\n$/.test(existing) ? "" : "\r\n") : `\uFEFF${header}\r\n`
      await file.writeFile(start + rows.map(row => row.map(csvValue).join("\t")).join("\r\n") + "\r\n", "utf8")
    } finally {
      await file.close()
    }
  } finally {
    await lock.close()
    const { unlink } = await import("node:fs/promises")
    await unlink(`${path}.lock`)
  }
  return path
}

const money = value => typeof value === "number" && Number.isFinite(value) ? value.toFixed(2).replace(".", ",") : ""

const financialHeaders = [
  "Fornecedor", "Nº NF", "Parcela", "Data de Emissão", "Data de Vencimento",
  "Valor (R$)", "Valor Pago (R$)", "Data de Pagamento", "Situação",
  "Forma de Pagamento", "Centro de Custo", "Observações", "Anexo/Link",
]
const productHeaders = [
  "Preço Pago (Total)", "Preço Unitário", "Preço sugerido venda", "Produto",
  "Código SKU", "Preço analisado do Site", "Código de barras", "Quantidade", "Unidade",
]

export function exportFinancialCsv(document, folder, date = new Date()) {
  const installments = Object.values(document.installments ?? {})
    .sort((first, second) => Number(first.number) - Number(second.number))
  const rows = installments.length ? installments.map(installment => [
    "hering", document.invoiceNumber, installment.number, document.issueDate,
    installment.dueDate, money(installment.amount), "", installment.dueDate,
    "A pagar", document.paymentMethod || "Boleto", "-", "-", "-",
  ]) : [[
    "hering", document.invoiceNumber, document.installment, document.issueDate,
    document.dueDate, money(document.totalAmount), money(document.paidAmount), document.dueDate,
    "A pagar", document.paymentMethod || "Boleto", "-", "-", "-",
  ]]
  const products = (document.items ?? []).map(product => [
    money(product.totalValue), money(product.unitValue), money(product.suggestedPrice),
    product.description, product.productCode,
    product.priceFoundOnHering === undefined ? "" : product.priceFoundOnHering ? "sim" : "não",
    product.cean, product.quantity, product.unit,
  ])
  const combinedRows = Array.from({ length: Math.max(rows.length, products.length) }, (_, index) => [
    ...(rows[index] ?? Array(financialHeaders.length).fill("")),
    ...(products[index] ?? Array(productHeaders.length).fill("")),
  ])
  return appendMonthlyCsv(folder, "contas-a-pagar", [...financialHeaders, ...productHeaders], combinedRows, date, financialHeaders)
}
