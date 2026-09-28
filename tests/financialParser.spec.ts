import { expect, test } from '@playwright/test'
import { parseExtractedPdf } from '../src/modules/pdf/services/invoiceParser.service'

const parse = (rawText: string) => parseExtractedPdf({ rawText, fileName: 'boleto.pdf', fileSize: 100, pageCount: 1 })

const schedule = '001 26/05/2026                  269,38 002 23/06/2026                  269,38 003 21/07/2026                  269,38 004 18/08/2026                  269,38 &#x20;'

test('stores every installment in a JSON-safe map independently of the issue month', () => {
  const result = JSON.parse(JSON.stringify(parse(`BOLETO\nData de Emissão: 28/04/2026\nValor do Documento: 1.077,52\n${schedule}`)))
  expect(result).toMatchObject({ installmentCount: 4, totalAmount: 1077.52 })
  expect(result.installments).toEqual({
    '001': { number: '001', dueDate: '26/05/2026', amount: 269.38 },
    '002': { number: '002', dueDate: '23/06/2026', amount: 269.38 },
    '003': { number: '003', dueDate: '21/07/2026', amount: 269.38 },
    '004': { number: '004', dueDate: '18/08/2026', amount: 269.38 },
  })
})

test('handles wrapped schedules and does not count repeated copies twice', () => {
  const wrapped = schedule.replace(/ +/g, '\n')
  expect(parse(`BOLETO\nEmissão: 01/08/2026\n${wrapped}\n${wrapped}`)).toMatchObject({
    installmentCount: 4, installments: { '004': { number: '004', dueDate: '18/08/2026', amount: 269.38 } },
  })
})

test('preserves different installment amounts across years', () => {
  expect(parse('BOLETO\nEmissão: 02-01-2027\n001 20/12/2026 100,00 002 20/01/2027 150,00')).toMatchObject({
    installmentCount: 2, installments: {
      '001': { number: '001', dueDate: '20/12/2026', amount: 100 },
      '002': { number: '002', dueDate: '20/01/2027', amount: 150 },
    },
  })
})

test('does not guess an installment for a missing, unmatched or ambiguous issue month', () => {
  for (const text of [schedule, `Emissão: 01/06/2027\n${schedule}`, 'Emissão: 01/06/2026\n001 10/06/2026 10,00 002 20/06/2026 20,00']) {
    expect(parse(text).installment).toBeUndefined()
  }
})

test('extracts financial fields and keeps emission separate from due date', () => {
  expect(parse(`BOLETO
Vencimento: 30/09/2026
Beneficiário: Comércio São José
Nº NF: 000123
Parcela: 02/03
Data de Emissão: 01/09/2026
Valor do Documento: R$ 1.234,56
Valor Pago: 100,00
Data de Pagamento: 02/09/2026
Forma de Pagamento: Pix
Centro de Custo: Administrativo
Observações: Pedido especial
Anexo/Link: https://example.com/nota`)).toMatchObject({
    issuerName: 'hering', invoiceNumber: '000123', installment: '02/03',
    issueDate: '01/09/2026', dueDate: '30/09/2026', totalAmount: 1234.56,
    paidAmount: 100, paymentDate: '30/09/2026', paymentMethod: 'Pix', paymentStatus: 'A pagar',
  })
})

test('leaves missing data blank and supplies only the requested defaults', () => {
  const result = parse('BOLETO\nVencimento\n30/09/2026\nValor do Documento\n250,00')
  expect(result).toMatchObject({ dueDate: '30/09/2026', totalAmount: 250, paymentMethod: 'Boleto', paymentStatus: 'A pagar' })
  expect(result.paymentDate).toBe('30/09/2026')
  for (const key of ['issueDate', 'paidAmount', 'costCenter', 'observations', 'attachmentLink'] as const) {
    expect(result[key]).toBeUndefined()
  }
})

test('reads the NF after Nº. and finds the due date in the month after emission', () => {
  expect(parse(`DANFE\nNº.004.636.352\nSÉRIE 178\nDATA DA EMISSÃO\n25/04/2026\n${schedule}`)).toMatchObject({
    issuerName: 'hering', invoiceNumber: '004.636.352', dueDate: '26/05/2026', paymentDate: '26/05/2026',
  })
  expect(parse('Emissão: 25/12/2026\n001 26/01/2027 100,00')).toMatchObject({ dueDate: '26/01/2027', paymentDate: '26/01/2027' })
})
