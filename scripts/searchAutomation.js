import { readFile } from "node:fs/promises"
import { appendMonthlyCsv, exportFinancialCsv } from "./monthlyCsv.js"
import { chromium } from 'playwright'


function getScriptArguments() {
  const [
    id = "",
    exportFolder = "",
    documentStorePath = "",
  ] = process.argv.slice(2)

  if (!id || !exportFolder || !documentStorePath) {
    throw new Error(
      "Informe o ID, a pasta de exportação e o caminho dos documentos.",
    )
  }

  return { id, exportFolder, documentStorePath }
}

function findDocumentById(documents, id) {
  const document = documents.find((document) => document.id === id)

  if (!document) {
    throw new Error(`Documento com ID "${id}" não encontrado.`)
  }

  return document
}

async function readDocuments(documentStorePath) {
  const content = await readFile(documentStorePath, "utf8")
  const documents = JSON.parse(content)

  if (!Array.isArray(documents)) {
    throw new Error("O arquivo de documentos deve conter um array.")
  }

  return documents
}

async function getDocumentExportData(id, documentStorePath) {
  const documents = await readDocuments(documentStorePath)
  const document = findDocumentById(documents, id)

  if (!Array.isArray(document.items)) {
    throw new Error(`O documento "${id}" não possui uma lista de itens válida.`)
  }

  return document
}

function getSKUCodes(products) {
  return [
    ...new Set(
      products.map(product => product.productCode.replace(/\/.*$/, ""))
    )
  ]
}

async function getProductsPrice(products) {
  const prices = []
  const heringUrl = "https://www.hering.com.br"

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  const skuCodes = getSKUCodes(products)

  for (const skuCode of skuCodes) {
    try {
      await page.goto(`${heringUrl}/busca?q=${skuCode}`)

      const priceLocator = page
        .locator('[data-shelf-price-spot-with-badge] > p')
        .first()

      await priceLocator.waitFor({
        state: "visible",
        timeout: 10000
      })

      const priceText = await priceLocator.innerText()

      console.log("SKU:", skuCode)
      console.log("Preço encontrado:", priceText)

      const formattedPrice = priceText
        .replace("R$", "")
        .trim()

      prices.push({
        price: formattedPrice,
        skuCode
      })

    } catch (error) {
      console.log(`[Erro no Playwright] SKU ${skuCode}:`, error)

      prices.push({
        price: "No price detected",
        skuCode
      })
    }
  }

  await browser.close()

  return prices
}

function getProductsWithSuggestedPrice(products, productsPrice) {
  return products.map(product => {
    const skuCode = product.productCode.replace(/\/.*$/, "")
    const priceFound = productsPrice.find(price => price.skuCode === skuCode)
    const priceText = String(priceFound?.price ?? "").trim()
    const sitePrice = Number(priceText.replace(/\./g, "").replace(",", "."))
    const priceFoundOnHering = priceText !== "" && Number.isFinite(sitePrice)

    return {
      ...product,
      suggestedPrice: priceFoundOnHering
        ? sitePrice
        : product.quantity * product.unitValue * 2,
      priceFoundOnHering
    }
  })
}

async function exportProductsCsv(products, exportFolder) {
  const headers = [
    "Preço Pago (Total)",
    "Preço Unitário",
    "Preço sugerido venda",
    "Produto",
    "Código SKU",
    "Preço analisado do Site"
  ]


  const rows = products.map(product => [
    product.totalValue.toFixed(2).replace(".", ","),
    product.unitValue.toFixed(2).replace(".",","),
    product.suggestedPrice.toFixed(2).replace(".", ","),
    product.description,
    product.productCode,
    product.priceFoundOnHering ? "sim" : "não"
  ])

  return appendMonthlyCsv(exportFolder, "precos", headers, rows)

}

async function runPriceSearch() {
  const { id, exportFolder, documentStorePath } = getScriptArguments()

  const document = await getDocumentExportData(id, documentStorePath)
  const products = document.items

  if (products.length === 0) {
    console.log("CSV exportado:", await exportFinancialCsv(document, exportFolder))
    return
  }

  console.log("Produtos:", products)
  console.log("Pasta de exportação:", exportFolder)

  const productsPrice = await getProductsPrice(products)
  console.log("Products price:", productsPrice)

  const productsWithSuggestedPrice = getProductsWithSuggestedPrice(products, productsPrice)
  const exportPath = await exportProductsCsv(productsWithSuggestedPrice, exportFolder)
  console.log("CSV financeiro exportado:", await exportFinancialCsv({ ...document, items: productsWithSuggestedPrice }, exportFolder))

  console.log("CSV exportado:", exportPath)

}

runPriceSearch().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
