'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layouts/app-shell'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { PAYMENT_STATUSES } from '@/lib/constants/navigation'
import { toast } from 'sonner'

function fmt(n: number) { return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(n) }

export default function RevenuePage() {
  const [entries, setEntries] = useState<any[]>([])
  const [filter, setFilter] = useState('')

  const load = () => {
    const q = filter ? `?paymentStatus=${filter}` : ''
    fetch(`/api/revenue${q}`).then(r => r.json()).then(j => setEntries(j.data?.data ?? j.data ?? []))
  }
  useEffect(load, [filter])

  async function markPaid(id: string) {
    await fetch(`/api/revenue/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentStatus: 'paid', paidDate: new Date().toISOString().slice(0,10) }) })
    toast.success('入金を確認しました')
    load()
  }

  return (
    <AppShell title="売上・入金">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Button size="sm" variant={filter === '' ? 'default' : 'outline'} onClick={() => setFilter('')}>すべて</Button>
        {Object.entries(PAYMENT_STATUSES).map(([k, v]) => (
          <Button key={k} size="sm" variant={filter === k ? 'default' : 'outline'} onClick={() => setFilter(k)}>{v.label}</Button>
        ))}
      </div>
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b"><tr>
            <th className="px-4 py-3 text-left font-medium">案件</th>
            <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">クライアント</th>
            <th className="px-4 py-3 text-center font-medium">ステータス</th>
            <th className="px-4 py-3 text-right font-medium">金額</th>
            <th className="px-4 py-3 text-center font-medium">操作</th>
          </tr></thead>
          <tbody>{entries.map(e => {
            const st = PAYMENT_STATUSES[e.payment_status as keyof typeof PAYMENT_STATUSES]
            const overdue = e.payment_status !== 'paid' && e.due_date && new Date(e.due_date) < new Date()
            return (
              <tr key={e.id} className={`border-b ${overdue ? 'border-l-4 border-l-red-500' : ''}`}>
                <td className="px-4 py-3 font-medium">{e.project?.title ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{e.project?.client?.name ?? '—'}</td>
                <td className="px-4 py-3 text-center">{st && <StatusBadge label={overdue ? '期限超過' : st.label} color={overdue ? 'red' : st.color} />}</td>
                <td className="px-4 py-3 text-right font-semibold">{fmt(e.amount)}</td>
                <td className="px-4 py-3 text-center">{e.payment_status !== 'paid' && <Button size="sm" variant="outline" onClick={() => markPaid(e.id)}>入金済み</Button>}</td>
              </tr>
            )
          })}</tbody>
        </table>
      </div>
    </AppShell>
  )
}
