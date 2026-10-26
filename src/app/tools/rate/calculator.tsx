'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calc } from '@/lib/takehome'

/** 目標の手取り年収から、税金・保険料を含めて必要な売上と時間単価を逆算する */

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(n)
const KEY = 'fos.tool.rate'
type In = { target: number; expenses: number; aoiro: number; hoursPerWeek: number; weeks: number; billableRatio: number; taxable: boolean }
const defaults: In = { target: 5000000, expenses: 600000, aoiro: 650000, hoursPerWeek: 40, weeks: 48, billableRatio: 0.6, taxable: false }

/** 手取りが目標に達する売上を二分探索で求める */
function requiredSales(i: In) {
  let lo = 0, hi = 100000000
  for (let k = 0; k < 40; k++) {
    const mid = Math.floor((lo + hi) / 2)
    const th = calc({ sales: mid, expenses: i.expenses, aoiro: i.aoiro, other: 0, withheld: 0, taxable: i.taxable, bizRate: 0, nhiRate: 0.1 }).takeHome
    if (th < i.target) lo = mid; else hi = mid
  }
  return Math.ceil(hi / 10000) * 10000
}

export function RateCalculator() {
  const [v, setV] = useState<In>(defaults)
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setV({ ...defaults, ...JSON.parse(s) }) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }, [v])
  const r = useMemo(() => {
    const sales = requiredSales(v)
    const d = calc({ sales, expenses: v.expenses, aoiro: v.aoiro, other: 0, withheld: 0, taxable: v.taxable, bizRate: 0, nhiRate: 0.1 })
    const billable = Math.max(1, Math.round(v.hoursPerWeek * v.weeks * v.billableRatio))
    const hourly = Math.ceil(sales / billable / 100) * 100
    return { sales, taxes: d.taxes + d.social, billable, hourly, daily: hourly * 8, monthly: Math.round(sales / 12) }
  }, [v])
  const num = (k: keyof In) => (e: React.ChangeEvent<HTMLInputElement>) => setV(s => ({ ...s, [k]: Number(e.target.value.replace(/[^\d.]/g, '')) || 0 }))

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">入力</h2>
        <div><Label className="text-xs">目標の手取り年収（税金・保険料を引いた後、円）</Label><Input inputMode="numeric" value={yen(v.target)} onChange={num('target')} /></div>
        <div><Label className="text-xs">年間の経費（円）</Label><Input inputMode="numeric" value={yen(v.expenses)} onChange={num('expenses')} /></div>
        <div>
          <Label className="text-xs">青色申告特別控除</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.aoiro} onChange={e => setV(s => ({ ...s, aoiro: Number(e.target.value) }))}>
            <option value={650000}>65 万円</option><option value={550000}>55 万円</option><option value={100000}>10 万円</option><option value={0}>なし（白色）</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label className="text-xs">週の労働時間</Label><Input inputMode="numeric" value={v.hoursPerWeek} onChange={num('hoursPerWeek')} /></div>
          <div><Label className="text-xs">年間の稼働週数</Label><Input inputMode="numeric" value={v.weeks} onChange={num('weeks')} /></div>
        </div>
        <div>
          <Label className="text-xs">請求できる時間の割合（営業・事務・学習を除く）</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.billableRatio} onChange={e => setV(s => ({ ...s, billableRatio: Number(e.target.value) }))}>
            <option value={0.5}>50%（営業・事務が多い）</option><option value={0.6}>60%（標準）</option><option value={0.7}>70%</option><option value={0.8}>80%（継続案件中心）</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.taxable} onChange={e => setV(s => ({ ...s, taxable: e.target.checked }))} />消費税の課税事業者（インボイス登録・2 割特例）</label>
        <p className="text-xs text-muted-foreground">税金・保険料は手取り計算シミュレーターと同じ式で概算（国保の所得割率 10%、事業税なし）。入力はこの端末にだけ保存されます。</p>
      </section>
      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">必要な時間単価（税抜）</p>
          <p className="mt-1 text-4xl font-bold">¥{yen(r.hourly)}<span className="ml-1 text-base font-normal text-muted-foreground">/時間</span></p>
          <p className="mt-1 text-sm text-muted-foreground">日単価（8 時間）¥{yen(r.daily)}・月の売上目安 ¥{yen(r.monthly)}</p>
        </div>
        <div className="rounded-xl border bg-white p-5 text-sm">
          <h2 className="text-sm font-semibold">逆算の内訳</h2>
          <table className="mt-3 w-full">
            <tbody>
              <tr className="border-b border-slate-100"><td className="py-1.5">目標の手取り</td><td className="py-1.5 text-right tabular-nums">¥{yen(v.target)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5">＋ 経費</td><td className="py-1.5 text-right tabular-nums">¥{yen(v.expenses)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5">＋ 税金・保険料（概算）</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.taxes)}</td></tr>
              <tr className="border-b border-slate-100 font-semibold"><td className="py-1.5">＝ 必要な年間売上</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.sales)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5">÷ 請求できる時間（{v.hoursPerWeek} 時間 × {v.weeks} 週 × {Math.round(v.billableRatio * 100)}%）</td><td className="py-1.5 text-right tabular-nums">{yen(r.billable)} 時間</td></tr>
              <tr className="font-semibold"><td className="py-1.5">＝ 必要な時間単価</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.hourly)}</td></tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">時給換算の「相場」と比べて高く感じる場合は、請求できる時間の割合を上げる（テンプレート化・継続案件）か、単価の高い領域に移るかの選択になります。</p>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm">
          <p className="font-semibold">見積に落とし込み、案件ごとの実績単価を記録するなら</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a href="https://freelancekt.booth.pm/items/8986468" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary hover:bg-primary hover:text-white">時間単価計算＋見積作成シート（780円）↗</a>
            <Link href="/tools/invoice" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-slate-50">見積書を作る（無料ツール）</Link>
            <Link href="/signup" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">FreelanceOS で案件を管理（無料）</Link> <Link href="/demo" className="ml-3 inline-flex h-9 items-center text-sm text-primary hover:underline">デモ画面を見る</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
