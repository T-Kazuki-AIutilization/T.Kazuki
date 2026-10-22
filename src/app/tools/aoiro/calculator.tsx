'use client'
import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calc } from '@/lib/takehome'

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(n)
const KEY = 'fos.tool.aoiro'
type In = { sales: number; expenses: number; nhiRate: number }
const defaults: In = { sales: 6000000, expenses: 1200000, nhiRate: 0.1 }
const OPTIONS = [
  { aoiro: 0, label: '白色申告' },
  { aoiro: 100000, label: '青色 10 万円控除（簡易簿記）' },
  { aoiro: 550000, label: '青色 55 万円控除（複式簿記・書面）' },
  { aoiro: 650000, label: '青色 65 万円控除（複式簿記・e-Tax）' },
]

export function AoiroCalculator() {
  const [v, setV] = useState<In>(defaults)
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setV({ ...defaults, ...JSON.parse(s) }) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }, [v])
  const rows = useMemo(() => OPTIONS.map((o) => {
    const r = calc({ sales: v.sales, expenses: v.expenses, aoiro: o.aoiro, other: 0, withheld: 0, taxable: false, bizRate: 0, nhiRate: v.nhiRate })
    return { ...o, burden: r.taxes + r.social - r.pension, r }
  }), [v])
  const white = rows[0].burden
  const num = (k: keyof In) => (e: React.ChangeEvent<HTMLInputElement>) => setV(s => ({ ...s, [k]: Number(e.target.value.replace(/[^\d]/g, '')) || 0 }))
  const best = rows[3]
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">入力（年間）</h2>
        <div><Label className="text-xs">売上（円）</Label><Input inputMode="numeric" value={yen(v.sales)} onChange={num('sales')} /></div>
        <div><Label className="text-xs">経費（円）</Label><Input inputMode="numeric" value={yen(v.expenses)} onChange={num('expenses')} /></div>
        <div>
          <Label className="text-xs">国民健康保険の所得割率</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.nhiRate} onChange={e => setV(s => ({ ...s, nhiRate: Number(e.target.value) }))}>
            <option value={0.09}>9%</option><option value={0.1}>10%（標準）</option><option value={0.11}>11%</option><option value={0.12}>12%</option><option value={0.13}>13%</option>
          </select>
        </div>
        <p className="text-xs text-muted-foreground">所得（売上 − 経費）: ¥{yen(Math.max(0, v.sales - v.expenses))}。入力はこの端末にだけ保存されます。</p>
      </section>
      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">青色 65 万円控除で、白色申告より軽くなる税金・保険料（年間）</p>
          <p className="mt-1 text-4xl font-bold">¥{yen(white - best.burden)}</p>
          <p className="mt-1 text-sm text-muted-foreground">所得税・住民税・国民健康保険の合計の差。国民年金は定額なので変わりません。</p>
        </div>
        <div className="overflow-x-auto rounded-xl border bg-white p-5">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">申告方法</th><th className="pr-3">所得税</th><th className="pr-3">住民税</th><th className="pr-3">国保</th><th className="pr-3">合計</th><th>白色との差</th></tr></thead>
            <tbody>
              {rows.map((x) => (
                <tr key={x.aoiro} className="border-b border-slate-100">
                  <td className="py-1.5 pr-3">{x.label}</td>
                  <td className="pr-3 tabular-nums">¥{yen(x.r.incomeTax)}</td>
                  <td className="pr-3 tabular-nums">¥{yen(x.r.residentTax)}</td>
                  <td className="pr-3 tabular-nums">¥{yen(x.r.nhi)}</td>
                  <td className="pr-3 tabular-nums font-semibold">¥{yen(x.burden)}</td>
                  <td className="tabular-nums text-green-700">{x.aoiro ? `−¥${yen(white - x.burden)}` : '−'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">2026 年分・独身で概算。国保は（所得 − 43 万円）× 所得割率 ＋ 均等割 6 万円（上限 109 万円）。青色申告特別控除は国保の計算に使う所得も下げます。個人事業税・消費税、青色事業専従者給与や赤字の繰越の効果は含みません。</p>
        </div>
      </section>
    </div>
  )
}
