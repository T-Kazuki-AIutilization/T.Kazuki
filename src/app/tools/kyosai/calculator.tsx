'use client'
import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calc } from '@/lib/takehome'

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(Math.round(n))
const KEY = 'fos.tool.kyosai'
type In = { year: number; sales: number; expenses: number; aoiro: number; ideco: number; kyosai: number }
const defaults: In = { year: 2026, sales: 6000000, expenses: 1200000, aoiro: 650000, ideco: 30000, kyosai: 30000 }
// 第 1 号の iDeCo の上限（国民年金基金・付加保険料と合計）。2026 年 12 月分（2027 年 1 月引き落とし）から 75,000 円
const idecoCap = (year: number) => (year >= 2027 ? 75000 : 68000)

export function KyosaiCalculator() {
  const [v, setV] = useState<In>(defaults)
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setV({ ...defaults, ...JSON.parse(s) }) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }, [v])
  const num = (k: keyof In) => (e: React.ChangeEvent<HTMLInputElement>) => setV(s => ({ ...s, [k]: Number(e.target.value.replace(/[^\d]/g, '')) || 0 }))
  const r = useMemo(() => {
    const ideco = Math.min(v.ideco, idecoCap(v.year)) * 12
    const kyosai = Math.min(Math.max(v.kyosai, 0), 70000) * 12
    const base = { sales: v.sales, expenses: v.expenses, aoiro: v.aoiro, withheld: 0, taxable: false, bizRate: 0, nhiRate: 0.1 }
    const a = calc({ ...base, other: 0 })
    const b = calc({ ...base, other: ideco + kyosai })
    const saveIt = a.incomeTax - b.incomeTax
    const saveRes = a.residentTax - b.residentTax
    return { ideco, kyosai, total: ideco + kyosai, saveIt, saveRes, save: saveIt + saveRes }
  }, [v])
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">入力</h2>
        <div>
          <Label className="text-xs">控除を受ける年分</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.year} onChange={e => setV(s => ({ ...s, year: Number(e.target.value) }))}>
            <option value={2026}>2026 年分（iDeCo の上限 月 68,000 円）</option><option value={2027}>2027 年分以降（iDeCo の上限 月 75,000 円）</option>
          </select>
        </div>
        <div><Label className="text-xs">年間の売上（円）</Label><Input inputMode="numeric" value={yen(v.sales)} onChange={num('sales')} /></div>
        <div><Label className="text-xs">年間の経費（円）</Label><Input inputMode="numeric" value={yen(v.expenses)} onChange={num('expenses')} /></div>
        <div>
          <Label className="text-xs">青色申告特別控除</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.aoiro} onChange={e => setV(s => ({ ...s, aoiro: Number(e.target.value) }))}>
            <option value={650000}>65 万円</option><option value={550000}>55 万円</option><option value={100000}>10 万円</option><option value={0}>なし（白色）</option>
          </select>
        </div>
        <div><Label className="text-xs">iDeCo の掛金（月額、自営業は上限 {yen(idecoCap(v.year))} 円）</Label><Input inputMode="numeric" value={yen(v.ideco)} onChange={num('ideco')} /></div>
        <div><Label className="text-xs">小規模企業共済の掛金（月額、1,000〜70,000 円）</Label><Input inputMode="numeric" value={yen(v.kyosai)} onChange={num('kyosai')} /></div>
        <p className="text-xs text-muted-foreground">iDeCo の上限は国民年金基金・付加保険料と合算で月 68,000 円。2026 年 12 月分（2027 年 1 月引き落とし分）から月 75,000 円に上がり、控除は支払った年なので 2027 年分から増えます。入力はこの端末にだけ保存されます。</p>
      </section>
      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">掛金（年 ¥{yen(r.total)}）で下がる税金（年間）</p>
          <p className="mt-1 text-4xl font-bold">¥{yen(r.save)}</p>
          <p className="mt-1 text-sm text-muted-foreground">掛金に対して {r.total > 0 ? Math.round((r.save / r.total) * 100) : 0}% の税金が戻る計算です（所得税 ¥{yen(r.saveIt)}＋住民税 ¥{yen(r.saveRes)}）。</p>
        </div>
        <div className="rounded-xl border bg-white p-5 text-sm">
          <table className="w-full">
            <tbody>
              <tr className="border-b border-slate-100"><td className="py-1.5">iDeCo（年）</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.ideco)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5">小規模企業共済（年）</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.kyosai)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5">所得税（復興特別所得税込み）の減少</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.saveIt)}</td></tr>
              <tr className="font-semibold"><td className="py-1.5">住民税の減少（翌年度）</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.saveRes)}</td></tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">掛金は全額が所得控除（小規模企業共済等掛金控除）になります。国民健康保険料は所得控除の影響を受けないため下がりません。独身で概算（税率・控除は 2026 年分）。</p>
        </div>
      </section>
    </div>
  )
}
