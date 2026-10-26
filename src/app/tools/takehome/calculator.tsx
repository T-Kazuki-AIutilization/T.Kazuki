'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { calc, type Inputs } from '@/lib/takehome'

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(n)

const KEY = 'fos.tool.takehome'
const defaults: Inputs = { sales: 5000000, expenses: 600000, aoiro: 650000, other: 0, withheld: 0, taxable: false, bizRate: 0, nhiRate: 0.1, ctRate: 0.2 }

export function TakeHomeCalculator() {
  const [v, setV] = useState<Inputs>(defaults)
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setV({ ...defaults, ...JSON.parse(s) }) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }, [v])
  const r = useMemo(() => calc(v), [v])
  const num = (k: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) => setV(s => ({ ...s, [k]: Number(e.target.value.replace(/[^\d]/g, '')) || 0 }))
  const rate = r.takeHome > 0 && v.sales > 0 ? Math.round((r.takeHome / v.sales) * 100) : 0

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">入力（年間・税抜）</h2>
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
        <div><Label className="text-xs">その他の所得控除（生命保険・iDeCo・小規模企業共済など）</Label><Input inputMode="numeric" value={yen(v.other)} onChange={num('other')} /></div>
        <div><Label className="text-xs">源泉徴収された所得税（還付の目安に使用）</Label><Input inputMode="numeric" value={yen(v.withheld)} onChange={num('withheld')} /></div>
        <div>
          <Label className="text-xs">個人事業税</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.bizRate} onChange={e => setV(s => ({ ...s, bizRate: Number(e.target.value) }))}>
            <option value={0}>非該当（ライター・プログラマー等）0%</option>
            <option value={0.05}>該当（デザイン・コンサル・製造等）5%</option>
            <option value={0.04}>4%（畜産・水産・薪炭製造）</option>
            <option value={0.03}>3%（あん摩・マッサージ等）</option>
          </select>
        </div>
        <div>
          <Label className="text-xs">国民健康保険の所得割率（自治体により 9〜13%。40 歳以上は介護分込み）</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.nhiRate} onChange={e => setV(s => ({ ...s, nhiRate: Number(e.target.value) }))}>
            <option value={0.09}>9%</option><option value={0.1}>10%（標準）</option><option value={0.11}>11%</option><option value={0.12}>12%</option><option value={0.13}>13%</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.taxable} onChange={e => setV(s => ({ ...s, taxable: e.target.checked }))} />消費税の課税事業者（インボイス登録した個人の特例で概算）</label>
        {v.taxable && (
          <div>
            <Label className="text-xs">消費税の特例（売上の消費税に対する納税額の割合）</Label>
            <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.ctRate ?? 0.2} onChange={e => setV(s => ({ ...s, ctRate: Number(e.target.value) }))}>
              <option value={0.2}>2 割特例（2026 年分まで）</option><option value={0.3}>3 割特例（2027・2028 年分）</option><option value={0.5}>簡易課税・サービス業（みなし仕入率 50%）</option>
            </select>
          </div>
        )}
        <p className="text-xs text-muted-foreground">入力はこの端末にだけ保存されます。</p>
      </section>

      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">年間の手取り（売上 − 経費 − 税金 − 保険料）</p>
          <p className="mt-1 text-4xl font-bold">¥{yen(r.takeHome)}</p>
          <p className="mt-1 text-sm text-muted-foreground">月あたり ¥{yen(Math.floor(r.takeHome / 12))}・売上に対する手取り率 {rate}%</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-sm font-semibold">内訳（年間）</h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              <Row label="売上" v={v.sales} />
              <Row label="経費" v={-v.expenses} />
              <Row label="青色申告特別控除" v={-r.aoiroApplied} muted />
              <Row label="事業所得（控除後）" v={r.income} bold />
              <Row label="国民年金" v={-r.pension} />
              <Row label="国民健康保険（概算）" v={-r.nhi} />
              <Row label="所得税（復興特別所得税込み）" v={-r.incomeTax} />
              <Row label="住民税（翌年 6 月から納付）" v={-r.residentTax} />
              {v.bizRate > 0 && <Row label="個人事業税" v={-r.bizTax} />}
              {v.taxable && <Row label={`消費税（売上の消費税 × ${Math.round((v.ctRate ?? 0.2) * 100)}%）`} v={-r.consumptionTax} />}
              <Row label="税金・保険料の合計" v={-(r.taxes + r.social)} bold />
              <Row label="手取り" v={r.takeHome} bold />
            </tbody>
          </table>
          {v.withheld > 0 && (
            <p className="mt-3 text-sm">源泉徴収との差額: {r.settle >= 0 ? `納付 ¥${yen(r.settle)}` : `還付 ¥${yen(-r.settle)}`}（確定申告で精算）</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            所得税の基礎控除は合計所得に応じて 95 万〜58 万円（2026 年分の上乗せ特例を反映）。住民税は所得割 10%＋均等割 5,000 円、国保は（所得 − 43 万円）× 所得割率 ＋ 均等割 6 万円で概算。配偶者・扶養控除、医療費控除、国保の家族分は含みません。
          </p>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm">
          <p className="font-semibold">税率や均等割を自分の自治体に合わせて細かく試算したい方へ</p>
          <p className="mt-1 text-muted-foreground">Excel 版「手取り計算シミュレーター」はパラメータを編集でき、売上別の早見表と納税資金の月割りも出ます。</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a href="https://freelancekt.booth.pm/items/8986475" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary hover:bg-primary hover:text-white">Excel 版を見る（680円）↗</a>
            <Link href="/signup" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">FreelanceOS で売上と入金を管理（無料）</Link> <Link href="/demo" className="ml-3 inline-flex h-9 items-center text-sm text-primary hover:underline">デモ画面を見る</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function Row({ label, v, bold, muted }: { label: string; v: number; bold?: boolean; muted?: boolean }) {
  return (
    <tr className={`border-b border-slate-100 ${bold ? 'font-semibold' : ''} ${muted ? 'text-muted-foreground' : ''}`}>
      <td className="py-1.5">{label}</td>
      <td className="py-1.5 text-right tabular-nums">{v < 0 ? `−¥${yen(-v)}` : `¥${yen(v)}`}</td>
    </tr>
  )
}
