'use client'
import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { medicalDeduction, savingFor, selfMedDeduction, type Earner } from '@/lib/iryohi'

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(Math.round(n))
const KEY = 'fos.tool.iryohi'
type In = { kind: 'freelance' | 'employee'; sales: number; expenses: number; aoiro: number; salary: number; paid: number; covered: number; otc: number }
const defaults: In = { kind: 'freelance', sales: 5000000, expenses: 1000000, aoiro: 650000, salary: 5000000, paid: 200000, covered: 0, otc: 0 }

export function IryohiCalculator() {
  const [v, setV] = useState<In>(defaults)
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setV({ ...defaults, ...JSON.parse(s) }) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }, [v])
  const num = (k: keyof In) => (e: React.ChangeEvent<HTMLInputElement>) => setV(s => ({ ...s, [k]: Number(e.target.value.replace(/[^\d]/g, '')) || 0 }))
  const r = useMemo(() => {
    const earner: Earner = v.kind === 'employee' ? { kind: 'employee', salary: v.salary } : { kind: 'freelance', sales: v.sales, expenses: v.expenses, aoiro: v.aoiro }
    const base = savingFor(earner, 0)
    const med = medicalDeduction(base.income, v.paid, v.covered)
    const self = selfMedDeduction(v.otc)
    const sMed = savingFor(earner, med.deduction)
    const sSelf = savingFor(earner, self)
    return { income: base.income, med, self, sMed, sSelf, best: sSelf.total > sMed.total ? 'self' : 'med' }
  }, [v])
  const best = r.best === 'self' ? r.sSelf : r.sMed
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">入力</h2>
        <div className="flex gap-2 text-sm">
          {(['freelance', 'employee'] as const).map(k => (
            <button key={k} type="button" onClick={() => setV(s => ({ ...s, kind: k }))} className={`flex-1 rounded-md border px-3 py-2 ${v.kind === k ? 'border-primary bg-primary/10 font-semibold text-primary' : 'hover:bg-slate-50'}`}>{k === 'freelance' ? 'フリーランス' : '会社員'}</button>
          ))}
        </div>
        {v.kind === 'freelance' ? (
          <>
            <div><Label className="text-xs">年間の売上（円）</Label><Input inputMode="numeric" value={yen(v.sales)} onChange={num('sales')} /></div>
            <div><Label className="text-xs">年間の経費（円）</Label><Input inputMode="numeric" value={yen(v.expenses)} onChange={num('expenses')} /></div>
            <div>
              <Label className="text-xs">青色申告特別控除</Label>
              <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.aoiro} onChange={e => setV(s => ({ ...s, aoiro: Number(e.target.value) }))}>
                <option value={650000}>65 万円</option><option value={550000}>55 万円</option><option value={100000}>10 万円</option><option value={0}>なし（白色）</option>
              </select>
            </div>
          </>
        ) : (
          <div><Label className="text-xs">年収（額面・円）</Label><Input inputMode="numeric" value={yen(v.salary)} onChange={num('salary')} /></div>
        )}
        <div><Label className="text-xs">1 年間に払った医療費（家族分も合計・円）</Label><Input inputMode="numeric" value={yen(v.paid)} onChange={num('paid')} /></div>
        <div><Label className="text-xs">保険金・高額療養費などで補填された額（円）</Label><Input inputMode="numeric" value={yen(v.covered)} onChange={num('covered')} /></div>
        <div><Label className="text-xs">セルフメディケーション対象の市販薬の購入額（円・任意）</Label><Input inputMode="numeric" value={yen(v.otc)} onChange={num('otc')} /></div>
        <p className="text-xs text-muted-foreground">入力はこの端末にだけ保存されます。</p>
      </section>
      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">{r.best === 'self' ? 'セルフメディケーション税制' : '医療費控除'}で下がる税金（年間）</p>
          <p className="mt-1 text-4xl font-bold">¥{yen(best.total)}</p>
          <p className="mt-1 text-sm text-muted-foreground">所得税 ¥{yen(best.it)}（{v.kind === 'employee' ? '確定申告で還付' : '確定申告で納める額が減る'}）＋ 住民税 ¥{yen(best.res)}（翌年度の住民税が減る）</p>
        </div>
        <div className="rounded-xl border bg-white p-5 text-sm">
          <table className="w-full">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2"></th><th className="text-right">医療費控除</th><th className="text-right">セルフメディケーション</th></tr></thead>
            <tbody>
              <tr className="border-b border-slate-100"><td className="py-1.5">差し引く額</td><td className="text-right tabular-nums">¥{yen(r.med.threshold)}</td><td className="text-right tabular-nums">¥12,000</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5">控除額</td><td className="text-right tabular-nums">¥{yen(r.med.deduction)}</td><td className="text-right tabular-nums">¥{yen(r.self)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5">所得税の減少</td><td className="text-right tabular-nums">¥{yen(r.sMed.it)}</td><td className="text-right tabular-nums">¥{yen(r.sSelf.it)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5">住民税の減少</td><td className="text-right tabular-nums">¥{yen(r.sMed.res)}</td><td className="text-right tabular-nums">¥{yen(r.sSelf.res)}</td></tr>
              <tr className="font-semibold"><td className="py-1.5">合計</td><td className="text-right tabular-nums">¥{yen(r.sMed.total)}</td><td className="text-right tabular-nums">¥{yen(r.sSelf.total)}</td></tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">総所得金額等 ¥{yen(r.income)}{r.income < 2000000 ? '（200 万円未満のため、差し引く額は 10 万円ではなく所得の 5%）' : ''}・所得税の税率 {Math.round(r.sMed.rate * 100)}%。医療費控除とセルフメディケーション税制はどちらか一方しか使えません。国民健康保険料は所得控除の影響を受けないため変わりません。2026 年分・独身で概算{v.kind === 'employee' ? '（会社員の社会保険料は年収の 15% で概算）' : ''}。</p>
        </div>
      </section>
    </div>
  )
}
