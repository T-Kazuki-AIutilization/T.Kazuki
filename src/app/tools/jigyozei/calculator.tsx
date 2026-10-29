'use client'
import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AOIRO_OPTIONS } from '@/lib/haigusha'
import { GYOSHU, JIGYOZEI_DEDUCT, jigyozei } from '@/lib/jigyozei'

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(n)
const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })
const KEY = 'fos.tool.jigyozei'
type In = { sales: number; expenses: number; aoiro: number; gyoshu: string; months: number }
const defaults: In = { sales: 7000000, expenses: 1500000, aoiro: 650000, gyoshu: 'design', months: 12 }

export function JigyozeiCalculator() {
  const [v, setV] = useState<In>(defaults)
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setV({ ...defaults, ...JSON.parse(s) }) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }, [v])
  const g = GYOSHU.find((x) => x.id === v.gyoshu) ?? GYOSHU[0]
  const profit = Math.max(0, v.sales - v.expenses)
  const r = useMemo(() => jigyozei({ profit, months: v.months, rate: g.rate }), [profit, v.months, g.rate])
  const aoiro = Math.min(v.aoiro, profit)
  const num = (k: keyof In) => (e: React.ChangeEvent<HTMLInputElement>) => setV(s => ({ ...s, [k]: Number(e.target.value.replace(/[^\d]/g, '')) || 0 }))
  const notes: string[] = []
  if (g.rate === 0) notes.push('法定業種に当たらない事業には個人事業税はかかりません。ただし業種の判断は都道府県が行い、仕事の実態によっては「請負業」「広告業」「デザイン業」などとされることがあります。')
  else if (r.tax === 0) notes.push(`事業所得が事業主控除（${man(r.deduction)} 万円）以下なので、個人事業税はかかりません。あと ${man(r.deduction - r.income)} 万円を超えると、超えた分に ${g.rate * 100}% がかかります。`)
  else notes.push(`事業主控除（${man(r.deduction)} 万円）を超えた ${man(r.income - r.deduction)} 万円に ${g.rate * 100}% がかかります。所得が 10 万円増えるごとに、個人事業税は約 ${yen(100000 * g.rate)} 円増えます。`)
  if (aoiro > 0 && r.tax > 0) notes.push(`青色申告特別控除（${man(aoiro)} 万円）は個人事業税では引けません。所得税の所得（${man(profit - aoiro)} 万円）より ${man(aoiro)} 万円大きい額で計算するため、${yen(Math.floor(aoiro * g.rate))} 円ほど多くなります。`)
  if (r.tax > 0) notes.push(r.second > 0 ? `納付は 8 月（第 1 期）約 ¥${yen(r.first)} と 11 月（第 2 期）約 ¥${yen(r.second)} の 2 回です（納期は都道府県により多少異なります）。` : '税額が 1 万円以下なので、8 月（第 1 期）に全額を納めます。')
  if (r.tax > 0) notes.push('払った個人事業税は、払った年の経費（租税公課）になります。2027 年 8 月・11 月に払う分は 2027 年分の経費です。')
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">事業の内容（1 年分）</h2>
        <div>
          <Label className="text-xs">業種</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.gyoshu} onChange={e => setV(s => ({ ...s, gyoshu: e.target.value }))}>
            {GYOSHU.map((o) => <option key={o.id} value={o.id}>{o.label}（{o.rate > 0 ? `${o.rate * 100}%` : '対象外'}）</option>)}
          </select>
        </div>
        <div><Label className="text-xs">売上（円）</Label><Input inputMode="numeric" value={yen(v.sales)} onChange={num('sales')} /></div>
        <div><Label className="text-xs">経費（円・青色事業専従者給与を含む）</Label><Input inputMode="numeric" value={yen(v.expenses)} onChange={num('expenses')} /></div>
        <div>
          <Label className="text-xs">所得税の申告方法（比較用）</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.aoiro} onChange={e => setV(s => ({ ...s, aoiro: Number(e.target.value) }))}>
            {AOIRO_OPTIONS.map((o) => <option key={o.aoiro} value={o.aoiro}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-xs">その年に事業をしていた月数（開業・廃業の年）</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.months} onChange={e => setV(s => ({ ...s, months: Number(e.target.value) }))}>
            {Array.from({ length: 12 }, (_, i) => 12 - i).map((m) => <option key={m} value={m}>{m === 12 ? '12 か月（1 年間）' : `${m} か月`}</option>)}
          </select>
        </div>
        <p className="text-xs text-muted-foreground">入力はこの端末にだけ保存されます。</p>
      </section>
      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">個人事業税（年額）</p>
          <p className="mt-1 text-3xl font-bold">¥{yen(r.tax)}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-muted-foreground">事業税の所得（青色控除の前）</p><p className="mt-1 text-lg font-semibold">¥{yen(r.income)}</p></div>
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-muted-foreground">事業主控除</p><p className="mt-1 text-lg font-semibold">¥{yen(r.deduction)}</p></div>
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-muted-foreground">課税所得 × 税率</p><p className="mt-1 text-lg font-semibold">¥{yen(r.taxable)} × {g.rate * 100}%</p></div>
          </div>
          {r.tax > 0 && <p className="mt-3 text-sm">8 月（第 1 期）約 <span className="font-semibold">¥{yen(r.first)}</span>{r.second > 0 && <> ／ 11 月（第 2 期）約 <span className="font-semibold">¥{yen(r.second)}</span></>}</p>}
        </div>
        <div className="rounded-xl border bg-white p-5 text-sm">
          <h3 className="font-semibold">計算のメモ</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">{notes.map((n) => <li key={n}>{n}</li>)}</ul>
          <p className="mt-3 text-xs text-muted-foreground">事業主控除は年 {man(JIGYOZEI_DEDUCT)} 万円（年の途中の開業・廃業は月割）。損失の繰越控除、白色申告の事業専従者控除、不動産所得の扱いは含みません。業種の判断と税額は、8 月ごろ都道府県から届く納税通知書でご確認ください。</p>
        </div>
      </section>
    </div>
  )
}
