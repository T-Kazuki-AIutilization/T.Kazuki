'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Row = { clientId: string | null; clientName: string; total: number; paid: number; unpaid: number; count: number; share: number }

function yen(n: number) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(n)
}

/** クライアント別の収益内訳（Pro+）。未加入なら案内を表示する。 */
export function ClientRevenueBreakdown() {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [locked, setLocked] = useState(false)
  const [grand, setGrand] = useState(0)

  useEffect(() => {
    fetch('/api/revenue/by-client')
      .then(async (r) => {
        if (r.status === 403) { setLocked(true); setRows([]); return }
        const j = await r.json()
        setRows(j.data?.rows ?? [])
        setGrand(j.data?.grandTotal ?? 0)
      })
      .catch(() => setRows([]))
  }, [])

  return (
    <section className="mt-8 rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">クライアント別の収益</h2>
        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Pro+</span>
      </div>
      {locked ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
          <p className="font-medium">クライアント別収益分析は Pro+ プランの機能です</p>
          <p className="mt-1 text-xs text-muted-foreground">売上の偏り（特定クライアントへの依存度）と未入金の集中を一覧で確認できます。</p>
          <Link href="/settings/billing" className="mt-2 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">プランを見る</Link>
        </div>
      ) : rows === null ? (
        <p className="text-xs text-muted-foreground">読み込み中...</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">売上を登録すると、クライアントごとの内訳が表示されます。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">クライアント</th>
                <th className="px-3 py-2 text-right font-medium">売上</th>
                <th className="px-3 py-2 text-right font-medium hidden sm:table-cell">入金済み</th>
                <th className="px-3 py-2 text-right font-medium">未入金</th>
                <th className="px-3 py-2 text-right font-medium hidden sm:table-cell">件数</th>
                <th className="px-3 py-2 text-left font-medium w-40">構成比</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.clientId ?? 'none'} className="border-b">
                  <td className="px-3 py-2 font-medium">{r.clientName}</td>
                  <td className="px-3 py-2 text-right">{yen(r.total)}</td>
                  <td className="px-3 py-2 text-right text-green-700 hidden sm:table-cell">{yen(r.paid)}</td>
                  <td className={`px-3 py-2 text-right ${r.unpaid > 0 ? 'text-amber-700' : ''}`}>{yen(r.unpaid)}</td>
                  <td className="px-3 py-2 text-right hidden sm:table-cell">{r.count}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded bg-slate-100"><div className="h-2 rounded bg-blue-600" style={{ width: `${Math.round(r.share * 100)}%` }} /></div>
                      <span className="w-10 text-right text-xs text-muted-foreground">{Math.round(r.share * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-semibold">
                <td className="px-3 py-2">合計</td>
                <td className="px-3 py-2 text-right">{yen(grand)}</td>
                <td className="px-3 py-2 hidden sm:table-cell" />
                <td className="px-3 py-2" />
                <td className="px-3 py-2 hidden sm:table-cell" />
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {rows[0] && rows[0].share >= 0.5 ? `最大クライアントへの依存度 ${Math.round(rows[0].share * 100)}%` : ''}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  )
}
