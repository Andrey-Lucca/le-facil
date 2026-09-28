import { expect, test } from '@playwright/test'
import { readFile, writeFile } from 'node:fs/promises'
import { parseExtractedPdf } from '../src/modules/pdf/services/invoiceParser.service'
// @ts-expect-error The export script runs directly in Node as JavaScript.
import { appendMonthlyCsv, exportFinancialCsv } from '../scripts/monthlyCsv.js'

test('exports one row per stored installment with its own number, date and amount', async () => {
  const document = parseExtractedPdf({
    fileName: 'synthetic.pdf', pageCount: 1, fileSize: 100,
    rawText: 'BOLETO\n001 26/05/2026 269,38 002 23/06/2026 269,38 003 21/07/2026 269,38 004 18/08/2026 269,38',
  })
  const path = await exportFinancialCsv(JSON.parse(JSON.stringify(document)), test.info().outputPath('installments'))
  const lines = (await readFile(path, 'utf8')).trimEnd().split('\r\n')
  expect(lines).toHaveLength(5)
  for (const line of lines.slice(1)) {
    const columns = line.split('\t')
    expect(columns[0]).toBe('hering')
    expect(columns[7]).toBe(columns[4])
    expect(columns.slice(10, 13)).toEqual(['-', '-', '-'])
  }
  expect(lines.slice(1).map(line => line.split('\t').slice(2, 6))).toEqual([
    ['001', '', '26/05/2026', '269,38'],
    ['002', '', '23/06/2026', '269,38'],
    ['003', '', '21/07/2026', '269,38'],
    ['004', '', '18/08/2026', '269,38'],
  ])
})

test('places products after financial columns without duplicating installments', async () => {
  const path = await exportFinancialCsv({
    installments: { '001': { number: '001', dueDate: '10/05/2026', amount: 50 } },
    items: [
      { totalValue: 50, unitValue: 25, suggestedPrice: 75, description: 'Camiseta', productCode: 'SKU/P', cean: '0012345678901', quantity: 2, unit: 'PC', priceFoundOnHering: true },
      { totalValue: 20, unitValue: 20, suggestedPrice: 40, description: 'Calça', productCode: 'SKU2', cean: '0098765432100', quantity: 1, unit: 'PC', priceFoundOnHering: false },
    ],
  }, test.info().outputPath('combined'))
  const lines = (await readFile(path, 'utf8')).replace(/\r\n$/, '').split('\r\n').map(line => line.split('\t'))
  expect(lines).toHaveLength(3)
  expect(lines[0]).toHaveLength(22)
  expect(lines[1].slice(13)).toEqual(['50,00', '25,00', '75,00', 'Camiseta', 'SKU/P', 'sim', '0012345678901', '2', 'PC'])
  expect(lines[2].slice(0, 13)).toEqual(Array(13).fill(''))
  expect(lines[2][17]).toBe('SKU2')
})

test('upgrades the previous monthly header and preserves quoted old records', async () => {
  const folder = test.info().outputPath('migration')
  const date = new Date(2026, 8, 28)
  const headers = ['Fornecedor', 'Nº NF', 'Parcela', 'Data de Emissão', 'Data de Vencimento', 'Valor (R$)', 'Valor Pago (R$)', 'Data de Pagamento', 'Situação', 'Forma de Pagamento', 'Centro de Custo', 'Observações', 'Anexo/Link']
  const path = await appendMonthlyCsv(folder, 'contas-a-pagar', headers, [['hering', '123', '001', '', '', '50,00', '', '', 'A pagar', 'Boleto', '-', 'Texto "com aspas"\ne quebra', '-']], date)
  const original = await readFile(path, 'utf8')
  await exportFinancialCsv({ invoiceNumber: '456', items: [] }, folder, date)
  const content = await readFile(path, 'utf8')
  expect(content).toContain('Código de barras')
  expect(content).toContain('hering\t123\t001')
  expect(content).toContain('"Texto ""com aspas""\ne quebra"\t-' + '\t'.repeat(9) + '\r\n')
  expect(content).toContain('hering\t456')
  expect(content.match(/Fornecedor\tNº NF/g)).toHaveLength(1)
  expect(await readFile(`${path}.before-products.bak`, 'utf8')).toBe(original)
})

test('appends different documents to the same month, preserves rows and rolls over months', async () => {
  const testInfo = test.info()
  const folder = testInfo.outputPath('exports')
  const date = new Date(2026, 8, 28)
  const path = await exportFinancialCsv({ issuerName: 'Fornecedor A', totalAmount: 1234.56 }, folder, date)
  const initial = await readFile(path, 'utf8')
  // Also support an existing file whose last line has no newline.
  await writeFile(path, initial.replace(/\r\n$/, ''), 'utf8')
  await exportFinancialCsv({ issuerName: 'Fornecedor B', invoiceNumber: '002', paidAmount: 0, dueDate: '30/09/2026', paymentDate: '01/09/2026', paymentMethod: 'Com "aspas"\te tabulação', observations: 'Ignorar' }, folder, date)
  const content = await readFile(path, 'utf8')
  expect(content.startsWith(initial)).toBeTruthy()
  expect(content.match(/Fornecedor\tNº NF/g)).toHaveLength(1)
  expect(content).toContain('hering\t002')
  expect(content).not.toContain('Fornecedor B')
  expect(content).not.toContain('Ignorar')
  expect(content).not.toContain('01/09/2026')
  expect(content).toContain('1.234,56'.replace('.', ''))
  expect(content).toContain('0,00')
  expect(content).toContain('A pagar\tBoleto')
  expect(content).toContain('"Com ""aspas""\te tabulação"')
  const nextPath = await exportFinancialCsv({ issuerName: 'Fornecedor C' }, folder, new Date(2026, 9, 1))
  expect(nextPath).not.toBe(path)
  expect(await readFile(nextPath, 'utf8')).not.toContain('1234,56')
})
