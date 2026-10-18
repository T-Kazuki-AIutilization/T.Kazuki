'use client'
import { DocumentEditor, today, type Doc } from '@/components/features/document-editor'

const initial: Doc = {
  kind: 'invoice',
  number: `${today().slice(0, 7).replace('-', '')}-0001`,
  date: today(),
  due: today(30),
  subject: '',
  clientName: '',
  items: [{ desc: '', qty: 1, unit: 0 }],
  withholding: false,
  note: 'お振込手数料は貴社にてご負担くださいますようお願いいたします。',
}

export function PublicInvoiceTool() {
  return <DocumentEditor storageKey="fos.tool.invoice" initial={initial} paid={false} backHref="/" backLabel="FreelanceOS トップ" publicMode />
}
