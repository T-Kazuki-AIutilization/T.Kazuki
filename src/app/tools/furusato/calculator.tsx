'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calc, IT_TABLE } from '@/lib/takehome'

/**
 * ふるさと納税の控除上限額（自己負担 2,000 円で済む寄附額）の概算。
 * 上限 = 住民税所得割額 × 20% ÷ (90% − 所得税の限界税率 × 1.021) ＋ 2,000 円
 * 限界税率は住民税の課税所得 − 人的控除差調整額（基礎控除分 5 万円）で判定（地方税法の特例控除割合）。
 */

const PERSONAL_DIFF = 50000
const floor = (n: number, unit = 1) => Math.floor(n / unit) * unit
const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(n)

type Inputs = { sales: number; expenses: number; aoiro: number; other: number; nhiRate: number }
const KEY = 'fos.tool.furusato'
const defaults: Inputs = { sales: 5000000, expenses: 600000, aoiro: 650000, other: 0, nhiRate: 0.1 }

export function furusatoLimit(i: Inputs) {
  const r = calc({ ...i, withheld: 0, taxable: false, bizRate: 0 })
  const shotokuwari = Math.max(0, r.taxableRes * 0.1 - 2500)
  const base = Math.max(0, r.taxableRes - PERSONAL_DIFF)
  const rate = base > 0 ? (IT_TABLE.find(([lo]) => base >= lo) ?? IT_TABLE[IT_TABLE.length - 1])[1] : 0
  const denom = 0.9 - rate * 1.021
  const limit = shotokuwari > 0 ? floor((shotokuwari * 0.2) / denom + 2000, 1000) : 0
  return { ...r, shotokuwari: floor(shotokuwari, 100), rate, limit }
}

export function FurusatoCalculator() {
  const [v, setV] = useState<Inputs>(defaults)
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setV({ ...defaults, ...JSON.parse(s) }) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }, [v])
  const r = useMemo(() => furusatoLimit(v), [v])
  const num = (k: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) => setV(s => ({ ...s, [k]: Number(e.target.value.replace(/[^\d]/g, '')) || 0 }))
  const safe = floor(r.limit * 0.9, 1000)

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">入力（2026 年の見込み・年間・税抜）</h2>
        <div><Label className="text-xs">売上（円）</Label><Input inputMode="numeric" value={yen(v.sales)} onChange={num('sales')} /></div>
        <div><Label className="text-xs">経費（円）</Label><Input inputMode="numeric" value={yen(v.expenses)} onChange={num('expenses')} /></div>
        <div>
          <Label className="text-xs">青色申告特別控除</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.aoiro} onChange={e => setV(s => ({ ...s, aoiro: Number(e.target.value) }))}>
            <option value={650000}>65 万円（複式簿記＋e-Tax）</option>
            <option value={550000}>55 万円（複式簿記・書面提出）</option>
            <option value={100000}>10 万円（簡易簿記）</option>
            <option value={0}>なし（白色申告）</option>
          </select>
        </div>
        <div><Label className="text-xs">その他の所得控除（iDeCo・小規模企業共済・生命保険料・扶養など）</Label><Input inputMode="numeric" value={yen(v.other)} onChange={num('other')} /></div>
        <div>
          <Label className="text-xs">国民健康保険の所得割率（社会保険料控除の計算に使用）</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.nhiRate} onChange={e => setV(s => ({ ...s, nhiRate: Number(e.target.value) }))}>
            <option value={0.09}>9%</option><option value={0.1}>10%（標準）</option><option value={0.11}>11%</option><option value={0.12}>12%</option><option value={0.13}>13%</option>
          </select>
        </div>
        <p className="text-xs text-muted-foreground">国民年金・国民健康保険は自動で社会保険料控除に含めます。入力はこの端末にだけ保存されます。</p>
      </section>

      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">自己負担 2,000 円で済む寄附額の上限（目安）</p>
          <p className="mt-1 text-4xl font-bold">¥{yen(r.limit)}</p>
          <p className="mt-1 text-sm text-muted-foreground">売上は年末まで確定しないため、安全に寄附するなら目安の 9 割（¥{yen(safe)}）程度までがおすすめです。</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-sm font-semibold">計算の内訳</h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              <Row label="事業所得（青色控除後）" v={`¥${yen(r.income)}`} />
              <Row label="社会保険料控除（国民年金＋国保の概算）" v={`¥${yen(r.social)}`} />
              <Row label="住民税の課税所得" v={`¥${yen(r.taxableRes)}`} />
              <Row label="住民税の所得割額（10%、調整控除後）" v={`¥${yen(r.shotokuwari)}`} />
              <Row label="所得税の税率（特例控除の判定用）" v={`${Math.round(r.rate * 100)}%`} />
              <Row label="上限額 ＝ 所得割 × 20% ÷（90% − 税率 × 1.021）＋ 2,000 円" v={`¥${yen(r.limit)}`} bold />
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">
            2026 年中の寄附は 2026 年分の所得で判定されます。配偶者・扶養控除、医療費控除、住宅ローン控除、給与など事業以外の所得は含みません（住宅ローン控除を使う人は上限が下がることがあります）。フリーランスは確定申告をするため、ワンストップ特例は使えず、確定申告で寄附金控除を申告します。
          </p>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm">
          <p className="font-semibold">年末に売上の着地を確認してから寄附する</p>
          <p className="mt-1 text-muted-foreground">FreelanceOS なら案件ごとの売上と入金をダッシュボードで集計できます。12 月の時点の年間売上の見込みがすぐわかります。</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/signup" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">FreelanceOS を無料ではじめる</Link>
            <Link href="/tools/takehome" className="inline-flex h-9 items-center rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary hover:bg-primary hover:text-white">手取りも計算する</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function Row({ label, v, bold }: { label: string; v: string; bold?: boolean }) {
  return (
    <tr className={`border-b border-slate-100 ${bold ? 'font-semibold' : ''}`}>
      <td className="py-1.5 pr-3">{label}</td>
      <td className="py-1.5 text-right tabular-nums whitespace-nowrap">{v}</td>
    </tr>
  )
}
