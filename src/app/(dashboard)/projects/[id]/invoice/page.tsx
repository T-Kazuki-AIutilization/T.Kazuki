'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DocumentEditor, today, type Doc, type Totals } from '@/components/features/document-editor'

/** 案件から見積書・納品書・請求書を作成するページ。請求書は売上・入金に「請求済み」で記録できる。 */
export default function ProjectInvoicePage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<any>(null)
  const [client, setClient] = useState<any>(null)
  const [paid, setPaid] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/account/usage').then(r => r.json()).then(j => setPaid(Boolean(j.data?.paid))).catch(() => setPaid(false))
    fetch(`/api/projects/${id}`).then(r => r.json()).then(j => {
      const p = j.data
      if (!p) return
      setProject(p)
      if (p.client_id) fetch(`/api/clients/${p.client_id}`).then(r => r.json()).then(c => setClient(c.data ?? null))
    })
  }, [id])

  if (!project) return <div className="p-8 text-sm text-muted-foreground">読み込み中...</div>

  const ym = today().slice(0, 7).replace('-', '')
  const initial: Doc = {
    kind: 'invoice',
    number: `${ym}-${String(project.id).slice(0, 4).toUpperCase()}`,
    date: today(),
    due: project.deadline ?? today(30),
    subject: project.title,
    items: [{ desc: project.title, qty: 1, unit: Number(project.amount) || 0 }],
    withholding: false,
    note: 'お振込手数料は貴社にてご負担くださいますようお願いいたします。',
  }
  const clientName = client ? (client.company_name ? `${client.company_name}\n${client.name}` : client.name) : (project.client?.name ?? '')

  async function onRecord(doc: Doc, totals: Totals) {
    const res = await fetch('/api/revenue', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id, amount: totals.total, paymentStatus: 'billed', billedDate: doc.date, dueDate: doc.due || null, memo: `請求書 ${doc.number}` }),
    })
    const j = await res.json()
    if (!res.ok) throw new Error(j.error?.message ?? '記録に失敗しました')
    return j.data?.id as string | undefined
  }

  return (
    <DocumentEditor
      storageKey={`fos.invoice.${project.id}`}
      initial={initial}
      fixedClientName={clientName}
      paid={paid}
      backHref={`/projects/${project.id}`}
      backLabel="案件に戻る"
      onRecord={onRecord}
    />
  )
}
