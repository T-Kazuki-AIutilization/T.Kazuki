'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * 国民健康保険料の概算。区分（医療・後期高齢者支援金・介護）ごとに
 * 所得割（基準所得 × 料率）＋ 均等割（人数）＋ 平等割（世帯）を計算し、区分ごとの上限を適用する。
 * 料率は自治体ごとに異なるため、すべて編集可能。低所得世帯の軽減（7・5・2 割）は含まない。
 */

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(Math.round(n))
const BASIC = 430000 // 基準所得の計算で差し引く基礎控除相当

type Part = { rate: number; perCapita: number; perHousehold: number; cap: number }
type In = {
  incomes: number[] // 世帯の加入者ごとの所得（売上 − 経費 − 青色控除。給与は給与所得）
  members40to64: number
  medical: Part; support: Part; care: Part
  childRate: number; childPerCapita: number
}
// 例示の料率（自治体により大きく異なる）。上限は 2025 年度の法定上限。
const defaults: In = {
  incomes: [3000000],
  members40to64: 0,
  medical: { rate: 0.077, perCapita: 47000, perHousehold: 0, cap: 660000 },
  support: { rate: 0.027, perCapita: 16000, perHousehold: 0, cap: 260000 },
  care: { rate: 0.022, perCapita: 16000, perHousehold: 0, cap: 170000 },
  childRate: 0, childPerCapita: 0,
}

export function calcNhi(v: In) {
  const base = v.incomes.reduce((s, x) => s + Math.max(0, x - BASIC), 0)
  const n = v.incomes.length
  const part = (p: Part, people: number, b: number) => Math.min(p.cap, Math.floor(b * p.rate + p.perCapita * people + (people > 0 ? p.perHousehold : 0)))
  const medical = part(v.medical, n, base)
  const support = part(v.support, n, base)
  const careBase = v.members40to64 > 0 ? v.incomes.slice(0, v.members40to64).reduce((s, x) => s + Math.max(0, x - BASIC), 0) : 0
  const care = v.members40to64 > 0 ? part(v.care, v.members40to64, careBase) : 0
  const child = Math.floor(base * v.childRate + v.childPerCapita * n)
  const total = Math.floor((medical + support + care + child) / 100) * 100
  return { base, medical, support, care, child, total }
}

const KEY = 'fos.tool.nhi'

export function NhiCalculator() {
  const [v, setV] = useState<In>(defaults)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setV({ ...defaults, ...JSON.parse(s) }) } catch {} setLoaded(true) }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }, [v])
  const r = useMemo(() => calcNhi(v), [v])
  const n = (s: string) => Number(s.replace(/[^\d.]/g, '')) || 0
  const setIncome = (i: number, s: string) => setV(x => ({ ...x, incomes: x.incomes.map((y, j) => (j === i ? n(s) : y)) }))
  const setPart = (k: 'medical' | 'support' | 'care', f: keyof Part, s: string, pct = false) =>
    setV(x => ({ ...x, [k]: { ...x[k], [f]: pct ? n(s) / 100 : n(s) } }))

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">世帯の加入者と所得</h2>
        {v.incomes.map((x, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex-1"><Label className="text-xs">{i === 0 ? 'あなたの所得（売上 − 経費 − 青色控除）' : `家族 ${i} の所得`}</Label><Input inputMode="numeric" value={yen(x)} onChange={e => setIncome(i, e.target.value)} /></div>
            {i > 0 && <button type="button" className="mb-2 text-xs text-muted-foreground hover:text-red-600" onClick={() => setV(s => ({ ...s, incomes: s.incomes.filter((_, j) => j !== i), members40to64: Math.min(s.members40to64, s.incomes.length - 1) }))}>削除</button>}
          </div>
        ))}
        <button type="button" className="text-xs text-primary hover:underline" onClick={() => setV(s => ({ ...s, incomes: [...s.incomes, 0] }))}>＋ 加入者（家族）を追加</button>
        <div>
          <Label className="text-xs">うち 40〜64 歳の人数（介護分の対象）</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.members40to64} onChange={e => setV(s => ({ ...s, members40to64: Number(e.target.value) }))}>
            {Array.from({ length: v.incomes.length + 1 }, (_, i) => <option key={i} value={i}>{i} 人</option>)}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">先頭から順に 40〜64 歳として計算します。</p>
        </div>

        <details key={loaded ? "loaded" : "init"} className="rounded-md border p-3">
          <summary className="cursor-pointer text-sm font-medium">料率を自治体の値に変更する</summary>
          <p className="mt-2 text-xs text-muted-foreground">お住まいの市区町村の「国民健康保険料（税）の料率」ページの値を入れてください。初期値は計算の例です。</p>
          {([['medical', '医療分'], ['support', '後期高齢者支援金分'], ['care', '介護分（40〜64 歳）']] as const).map(([k, label]) => (
            <div key={k} className="mt-3">
              <p className="text-xs font-semibold">{label}</p>
              <div className="mt-1 grid grid-cols-4 gap-1">
                <div><Label className="text-[10px]">所得割 %</Label><Input inputMode="decimal" defaultValue={(v[k].rate * 100).toFixed(2)} onBlur={e => setPart(k, 'rate', e.target.value, true)} /></div>
                <div><Label className="text-[10px]">均等割 円</Label><Input inputMode="numeric" defaultValue={v[k].perCapita} onBlur={e => setPart(k, 'perCapita', e.target.value)} /></div>
                <div><Label className="text-[10px]">平等割 円</Label><Input inputMode="numeric" defaultValue={v[k].perHousehold} onBlur={e => setPart(k, 'perHousehold', e.target.value)} /></div>
                <div><Label className="text-[10px]">上限 円</Label><Input inputMode="numeric" defaultValue={v[k].cap} onBlur={e => setPart(k, 'cap', e.target.value)} /></div>
              </div>
            </div>
          ))}
          <div className="mt-3">
            <p className="text-xs font-semibold">子ども・子育て支援金分（2026 年度から）</p>
            <div className="mt-1 grid grid-cols-2 gap-1">
              <div><Label className="text-[10px]">所得割 %</Label><Input inputMode="decimal" defaultValue={(v.childRate * 100).toFixed(2)} onBlur={e => setV(s => ({ ...s, childRate: n(e.target.value) / 100 }))} /></div>
              <div><Label className="text-[10px]">均等割 円</Label><Input inputMode="numeric" defaultValue={v.childPerCapita} onBlur={e => setV(s => ({ ...s, childPerCapita: n(e.target.value) }))} /></div>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">料率は自治体の通知で確認してください（初期値 0）。</p>
          </div>
        </details>
        <p className="text-xs text-muted-foreground">入力はこの端末にだけ保存されます。</p>
      </section>

      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">国民健康保険料（年額・概算）</p>
          <p className="mt-1 text-4xl font-bold">¥{yen(r.total)}</p>
          <p className="mt-1 text-sm text-muted-foreground">月あたり約 ¥{yen(r.total / 12)}（多くの自治体は 6 月〜翌 3 月の 10 回払い: 1 回約 ¥{yen(r.total / 10)}）</p>
        </div>
        <div className="rounded-xl border bg-white p-5 text-sm">
          <h2 className="text-sm font-semibold">内訳</h2>
          <table className="mt-3 w-full">
            <tbody>
              <tr className="border-b border-slate-100"><td className="py-1.5">基準所得（所得 − 43 万円 の合計）</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.base)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5">医療分</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.medical)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5">後期高齢者支援金分</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.support)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5">介護分</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.care)}</td></tr>
              {r.child > 0 && <tr className="border-b border-slate-100"><td className="py-1.5">子ども・子育て支援金分</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.child)}</td></tr>}
              <tr className="font-semibold"><td className="py-1.5">合計（100 円未満切り捨て）</td><td className="py-1.5 text-right tabular-nums">¥{yen(r.total)}</td></tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">低所得世帯の均等割・平等割の軽減（7 割・5 割・2 割）、未就学児の均等割軽減、非自発的失業者の軽減、産前産後の免除は含みません。該当しそうな場合は自治体に確認してください。払った保険料は全額が社会保険料控除になります。</p>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm">
          <p className="font-semibold">所得税・住民税・年金も含めた手取りを見るなら</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/tools/takehome" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">手取り計算シミュレーター（無料）</Link>
            <a href="https://freelancekt.booth.pm/items/8990973" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary hover:bg-primary hover:text-white">資金繰り表＋納税資金積立（980円）↗</a>
          </div>
        </div>
      </section>
    </div>
  )
}
