'use client'
import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { furusatoLimitEmployee, sideJobTax } from '@/lib/fukugyo'
import Link from 'next/link'

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(n)
const KEY = 'fos.tool.fukugyo'
type In = { salary: number; sales: number; expenses: number }
const defaults: In = { salary: 5000000, sales: 800000, expenses: 200000 }

export function FukugyoCalculator() {
  const [v, setV] = useState<In>(defaults)
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setV({ ...defaults, ...JSON.parse(s) }) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }, [v])
  const side = Math.max(0, v.sales - v.expenses)
  const r = useMemo(() => sideJobTax(v.salary, side), [v.salary, side])
  const furusato = useMemo(() => ({ before: furusatoLimitEmployee(v.salary, 0), after: furusatoLimitEmployee(v.salary, side) }), [v.salary, side])
  const num = (k: keyof In) => (e: React.ChangeEvent<HTMLInputElement>) => setV(s => ({ ...s, [k]: Number(e.target.value.replace(/[^\d]/g, '')) || 0 }))
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">入力（年間）</h2>
        <div><Label className="text-xs">会社の年収（額面・円）</Label><Input inputMode="numeric" value={yen(v.salary)} onChange={num('salary')} /></div>
        <div><Label className="text-xs">副業の売上（円）</Label><Input inputMode="numeric" value={yen(v.sales)} onChange={num('sales')} /></div>
        <div><Label className="text-xs">副業の経費（円）</Label><Input inputMode="numeric" value={yen(v.expenses)} onChange={num('expenses')} /></div>
        <p className="text-xs text-muted-foreground">副業の所得（売上 − 経費）: ¥{yen(side)}。入力はこの端末にだけ保存されます。</p>
      </section>
      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">副業で増える税金（所得税＋住民税）</p>
          <p className="mt-1 text-4xl font-bold">¥{yen(r.total)}</p>
          <p className="mt-1 text-sm text-muted-foreground">副業の所得 ¥{yen(side)} のうち、手元に残るのは約 ¥{yen(r.keep)}（{side > 0 ? Math.round((r.keep / side) * 100) : 0}%）</p>
        </div>
        <div className="rounded-xl border bg-white p-5 text-sm">
          <table className="w-full">
            <tbody>
              <tr className="border-b border-slate-100"><td className="py-1.5">所得税（復興特別所得税込み）の増加</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.incomeTax)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5">住民税の増加（翌年 6 月から）</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.residentTax)}</td></tr>
              <tr className="font-semibold"><td className="py-1.5">合計</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.total)}</td></tr>
            </tbody>
          </table>
          {r.rule20 && side > 0 && <p className="mt-3 rounded bg-amber-50 p-2 text-xs">副業の所得が 20 万円以下なので、所得税の確定申告は不要です（所得税の増加は 0 として計算）。住民税の申告は必要です。</p>}
          {!r.rule20 && <p className="mt-3 text-xs text-muted-foreground">副業の所得が 20 万円を超えるため、確定申告が必要です。所得税の税率（限界税率）は {Math.round(r.rate * 100)}% です。</p>}
          <p className="mt-2 text-xs text-muted-foreground">ふるさと納税の上限額（目安）: 副業なし ¥{yen(furusato.before)} → 副業あり ¥{yen(furusato.after)}。副業の申告をするとワンストップ特例は無効になるので、申告書に寄附金控除を書いてください（<Link href="/blog/side-job-furusato-nozei" className="text-primary hover:underline">詳しく</Link>）。</p>
          <p className="mt-2 text-xs text-muted-foreground">会社の社会保険料（健康保険・厚生年金）は副業の所得では変わりません。会社員の社会保険料は年収の 15% で概算。扶養控除・生命保険料控除・iDeCo などは含みません。</p>
        </div>
      </section>
    </div>
  )
}
