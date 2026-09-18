import { expect, test } from '@playwright/test'
import { parseExtractedPdf } from '../src/modules/pdf/services/invoiceParser.service'
import { parseInvoiceProductLine } from '../src/modules/pdf/utils/tableLineParser'

test('keeps quantity and prices aligned when the final tax rates are absent', () => {
  const result = parseExtractedPdf({
    fileName: 'nota.pdf',
    rawText: 'DANFE\nKTNYN10SI/P CAMISETA 61091000 000 5102 UN 3,0000 19,9900 59,97 59,97 10,79 0,00',
    pageCount: 1,
    fileSize: 100,
  })

  expect(result.status).toBe('success')
  expect(result.items).toHaveLength(1)
  expect(result.items[0]).toMatchObject({
    productCode: 'KTNYN10SI/P',
    description: 'CAMISETA',
    quantity: 3,
    unitValue: 19.99,
    totalValue: 59.97,
    icmsBaseValue: 59.97,
    icmsValue: 10.79,
    ipiValue: 0,
    icmsRate: 0,
    ipiRate: 0,
  })
})

test('preserves numeric descriptions and reads the fiscal columns in order', () => {
  const item = parseInvoiceProductLine(
    'KTNYN10SI/G CAMISETA 2026 TAM 42 PED123 7891234567890 61091000 000 5102 UN 2,0000 1.299,9900 2.599,98 2.599,98 467,9964 0,00 18,00 0,00',
  )

  expect(item).toMatchObject({
    description: 'CAMISETA 2026 TAM 42',
    orderNumber: 'PED123',
    cean: '7891234567890',
    ncmSh: '61091000',
    cst: '000',
    cfop: '5102',
    unit: 'UN',
    quantity: 2,
    unitValue: 1299.99,
    totalValue: 2599.98,
    icmsRate: 18,
  })
})

test('accepts quantity and prices without optional tax values', () => {
  expect(parseInvoiceProductLine('N1TEN0A00S BLUSA 61091000 102 6102 PC 4 12,50 50,00'))
    .toMatchObject({ quantity: 4, unitValue: 12.5, totalValue: 50, icmsValue: 0 })
})

test('rejects incomplete or ambiguous numeric columns', () => {
  expect(parseInvoiceProductLine('SKU1 BLUSA 61091000 000 5102 UN 3 19,99')).toBeNull()
  expect(parseInvoiceProductLine('SKU1 BLUSA 61091000 000 5102 UN 3 19,99 59,97 EXTRA')).toBeNull()
  expect(parseInvoiceProductLine('SKU1 BLUSA 61091000 000 5102 UN 3 19,99 59,97 0 0 0 0 0 10')).toBeNull()
})
