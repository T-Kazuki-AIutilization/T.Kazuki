'use client'
import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ASSETS, LIVES, type Method, judgeCost, options, schedule } from '@/lib/genka'

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(n)
const KEY = 'fos.tool.genka'
type In = { price: number; asset: string; life: number; method: Method; year: number; month: number; ratio: number; aoiro: boolean; zeinuki: boolean; taxRate: number }
const defaults: In = { price: 250000, asset: 'pc', life: 4, method: 'teigaku', year: 2026, month: 12, ratio: 100, aoiro: true, zeinuki: false, taxRate: 0.2 }
const TAX_RATES = [
  { v: 0.15, label: '15%（所得税 5% ＋ 住民税 10%）' },
  { v: 0.2, label: '20%（所得税 10% ＋ 住民税 10%）' },
  { v: 0.3, label: '30%（所得税 20% ＋ 住民税 10%）' },
  { v: 0.33, label: '33%（所得税 23% ＋ 住民税 10%）' },
  { v: 0.43, label: '43%（所得税 33% ＋ 住民税 10%）' },
]

export function GenkaCalculator() {
  const [v, setV] = useState<In>(defaults)
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setV({ ...defaults, ...JSON.parse(s) }) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }, [v])
  const a = ASSETS.find((x) => x.id === v.asset) ?? ASSETS[0]
  const life = a.id === 'custom' ? v.life : a.life
  const intangible = 'intangible' in a && a.intangible
  const cost = judgeCost(v.price, v.zeinuki)
  const ratio = Math.min(100, Math.max(0, v.ratio)) / 100
  const input = { cost, life, method: v.method, year: v.year, month: v.month, ratio, aoiro: v.aoiro, intangible }
  const opts = useMemo(() => options(input), [cost, life, v.method, v.year, v.month, ratio, v.aoiro, intangible]) // eslint-disable-line react-hooks/exhaustive-deps
  const rows = useMemo(() => (cost >= 100000 ? schedule(input) : []), [cost, life, v.method, v.year, v.month, ratio, intangible]) // eslint-disable-line react-hooks/exhaustive-deps
  const best = opts.reduce((m, o) => (o.first > m.first ? o : m), opts[0] ?? { first: 0, label: '', id: 'normal', years: [], note: '' })
  const normal = opts.find((o) => o.id === 'normal')
  const num = (k: keyof In) => (e: React.ChangeEvent<HTMLInputElement>) => setV((s) => ({ ...s, [k]: Number(e.target.value.replace(/[^\d]/g, '')) || 0 }))
  const notes: string[] = []
  if (cost >= 100000 && cost < 400000 && !v.aoiro) notes.push('青色申告なら「少額減価償却資産の特例」で、取得価額 40 万円未満（2026 年 4 月以後の取得）を使い始めた年に全額経費にできます。')
  if (normal && best.id !== 'normal' && best.first > normal.first) notes.push(`今年の経費は通常の減価償却より ¥${yen(best.first - normal.first)} 多くなり、所得税・住民税は約 ¥${yen(Math.floor((best.first - normal.first) * v.taxRate))} 少なくなる目安です（その分、来年以降の経費は減ります。合計の経費は同じです）。`)
  if (v.month === 12 && normal && cost >= 100000) notes.push('12 月に使い始めた場合、通常の減価償却は 1 か月分だけです。年内に買っても、使い始めるのが 1 月なら来年の経費になります。')
  if (opts.some((o) => o.id === 'shogaku')) notes.push('少額減価償却資産の特例を使った資産は、市区町村の償却資産税（固定資産税）の申告の対象になります（一括償却資産と 10 万円未満のものは対象外）。')
  if (ratio < 1) notes.push(`事業で使う割合 ${v.ratio}% を掛けた額を経費にしています。取得価額が 10 万・20 万・40 万円未満かどうかは、割合を掛ける前の額で判定します。`)
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">買ったもの</h2>
        <div>
          <Label className="text-xs">種類（耐用年数）</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.asset} onChange={(e) => setV((s) => ({ ...s, asset: e.target.value }))}>
            {ASSETS.map((o) => <option key={o.id} value={o.id}>{o.label}{o.life > 0 ? `（${o.life} 年）` : ''}</option>)}
          </select>
        </div>
        {a.id === 'custom' && (
          <div>
            <Label className="text-xs">耐用年数</Label>
            <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.life} onChange={(e) => setV((s) => ({ ...s, life: Number(e.target.value) }))}>
              {LIVES.map((n) => <option key={n} value={n}>{n} 年</option>)}
            </select>
          </div>
        )}
        <div><Label className="text-xs">取得価額（購入代金＋送料・設置費用など、円）</Label><Input inputMode="numeric" value={yen(v.price)} onChange={num('price')} /></div>
        <div>
          <Label className="text-xs">消費税の経理方式</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.zeinuki ? '1' : '0'} onChange={(e) => setV((s) => ({ ...s, zeinuki: e.target.value === '1' }))}>
            <option value="0">税込経理（免税事業者はこちら）</option>
            <option value="1">税抜経理（入力額から消費税 10% を除いて判定）</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">使い始めた年</Label>
            <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.year} onChange={(e) => setV((s) => ({ ...s, year: Number(e.target.value) }))}>
              {[2025, 2026, 2027, 2028].map((y) => <option key={y} value={y}>{y} 年</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs">使い始めた月</Label>
            <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.month} onChange={(e) => setV((s) => ({ ...s, month: Number(e.target.value) }))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m} 月</option>)}
            </select>
          </div>
        </div>
        <div><Label className="text-xs">事業で使う割合（%）</Label><Input inputMode="numeric" value={String(v.ratio)} onChange={num('ratio')} /></div>
        <div>
          <Label className="text-xs">確定申告</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.aoiro ? '1' : '0'} onChange={(e) => setV((s) => ({ ...s, aoiro: e.target.value === '1' }))}>
            <option value="1">青色申告</option>
            <option value="0">白色申告</option>
          </select>
        </div>
        {!intangible && (
          <div>
            <Label className="text-xs">償却方法</Label>
            <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.method} onChange={(e) => setV((s) => ({ ...s, method: e.target.value as Method }))}>
              <option value="teigaku">定額法（届出をしていなければこちら）</option>
              <option value="teiritsu">定率法（税務署に届出済みの場合）</option>
            </select>
          </div>
        )}
        <div>
          <Label className="text-xs">税率の目安（節税額の計算用）</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.taxRate} onChange={(e) => setV((s) => ({ ...s, taxRate: Number(e.target.value) }))}>
            {TAX_RATES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
          </select>
        </div>
        <p className="text-xs text-muted-foreground">入力はこの端末にだけ保存されます。</p>
      </section>
      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">{v.year} 年に経費にできる額（いちばん多い方法）</p>
          <p className="mt-1 text-3xl font-bold">¥{yen(best?.first ?? 0)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{best?.label}{v.zeinuki && cost > 0 ? `／判定に使う取得価額 ¥${yen(cost)}` : ''}</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">方法</th><th className="pr-3 text-right">{v.year} 年の経費</th><th className="pr-3 text-right">節税の目安</th><th>経費にする期間</th></tr></thead>
              <tbody>
                {opts.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 align-top">
                    <td className="py-1.5 pr-3">{o.label}<p className="text-xs text-muted-foreground">{o.note}</p></td>
                    <td className="pr-3 text-right tabular-nums">¥{yen(o.first)}</td>
                    <td className="pr-3 text-right tabular-nums">¥{yen(Math.floor(o.first * v.taxRate))}</td>
                    <td className="whitespace-nowrap">{o.years.length > 1 ? `${o.years[0].year}〜${o.years[o.years.length - 1].year} 年` : `${o.years[0]?.year ?? v.year} 年のみ`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {rows.length > 0 && (
          <div className="rounded-xl border bg-white p-5 text-sm">
            <h3 className="font-semibold">通常の減価償却の年ごとの額（{intangible || v.method === 'teigaku' ? '定額法' : '定率法'}・耐用年数 {life} 年）</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">年</th><th className="pr-3 text-right">月数</th><th className="pr-3 text-right">償却費</th><th className="pr-3 text-right">経費（事業割合）</th><th className="text-right">年末の未償却残高</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.year} className="border-b border-slate-100">
                      <td className="py-1.5 pr-3">{r.year} 年</td>
                      <td className="pr-3 text-right tabular-nums">{r.months}</td>
                      <td className="pr-3 text-right tabular-nums">¥{yen(r.dep)}</td>
                      <td className="pr-3 text-right tabular-nums">¥{yen(r.expense)}</td>
                      <td className="text-right tabular-nums">¥{yen(r.end)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {notes.length > 0 && (
          <div className="rounded-xl border bg-white p-5 text-sm">
            <h3 className="font-semibold">計算のメモ</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">{notes.map((n) => <li key={n}>{n}</li>)}</ul>
          </div>
        )}
      </section>
    </div>
  )
}
