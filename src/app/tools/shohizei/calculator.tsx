'use client'
import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { JIGYO, calc, deadline, tokurei } from '@/lib/shohizei'

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(n)
const KEY = 'fos.tool.shohizei'
type In = { year: number; std: number; stdRefund: number; red: number; redRefund: number; jigyo: number }
const defaults: In = { year: 2026, std: 5500000, stdRefund: 0, red: 0, redRefund: 0, jigyo: 5 }

export function ShohizeiCalculator() {
  const [v, setV] = useState<In>(defaults)
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setV({ ...defaults, ...JSON.parse(s) }) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }, [v])
  const num = (k: keyof In) => (e: React.ChangeEvent<HTMLInputElement>) => setV((s) => ({ ...s, [k]: Number(e.target.value.replace(/[^\d]/g, '')) || 0 }))
  const t = tokurei(v.year)
  const j = JIGYO.find((x) => x.id === v.jigyo) ?? JIGYO[4]
  const sales = { std: v.std, stdRefund: v.stdRefund, red: v.red, redRefund: v.redRefund }
  const main = useMemo(() => calc({ ...sales, deductionRate: t?.rate ?? j.rate }), [v.std, v.stdRefund, v.red, v.redRefund, t?.rate, j.rate]) // eslint-disable-line react-hooks/exhaustive-deps
  const kani = useMemo(() => calc({ ...sales, deductionRate: j.rate }), [v.std, v.stdRefund, v.red, v.redRefund, j.rate]) // eslint-disable-line react-hooks/exhaustive-deps
  const compare = [
    ...(v.year <= 2026 ? [{ label: '2 割特例', r: calc({ ...sales, deductionRate: 0.8 }) }] : []),
    ...(v.year <= 2028 ? [{ label: '3 割特例', r: calc({ ...sales, deductionRate: 0.7 }) }] : []),
    { label: `簡易課税・${j.label}`, r: kani },
  ]
  const gross = Math.max(0, v.std - v.stdRefund) + Math.max(0, v.red - v.redRefund)
  const pct = gross > 0 ? Math.round((main.total / gross) * 1000) / 10 : 0
  const notes: string[] = []
  if (t && kani.total < main.total) notes.push(`簡易課税（${j.label}）のほうが ¥${yen(main.total - kani.total)} 少なくなります。${t.label}を使った年の翌年分の確定申告期限までに「消費税簡易課税制度選択届出書」を出せば、その翌年分から簡易課税を使えます。`)
  if (v.year === 2026) notes.push('2 割特例を使えるのは 2026 年分が最後です。2027・2028 年分は 3 割特例（売上の消費税 × 30%）になります。')
  if (!t) notes.push('3 割特例は 2028 年分で終わり、2029 年分からは簡易課税か本則課税（一般課税）です。本則課税は経費の消費税を実額で集計するため、このツールでは計算していません。')
  notes.push('申告書を出しても納付書は届きません。期限までに自分で納付するか、振替納税を申し込んでおきましょう。')
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">売上（1 年分・税込）</h2>
        <div>
          <Label className="text-xs">申告する年分</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.year} onChange={(e) => setV((s) => ({ ...s, year: Number(e.target.value) }))}>
            {[2026, 2027, 2028, 2029].map((y) => <option key={y} value={y}>{y} 年分（{deadline(y).replace(/（.）/, '')}まで）</option>)}
          </select>
        </div>
        <div><Label className="text-xs">売上（10% の分、税込・源泉徴収前の額、円）</Label><Input inputMode="numeric" value={yen(v.std)} onChange={num('std')} /></div>
        <div><Label className="text-xs">うち値引き・返品（10% の分、税込、円）</Label><Input inputMode="numeric" value={yen(v.stdRefund)} onChange={num('stdRefund')} /></div>
        <div><Label className="text-xs">売上（8% の分・飲食料品など、税込、円）</Label><Input inputMode="numeric" value={yen(v.red)} onChange={num('red')} /></div>
        <div><Label className="text-xs">うち値引き・返品（8% の分、税込、円）</Label><Input inputMode="numeric" value={yen(v.redRefund)} onChange={num('redRefund')} /></div>
        <div>
          <Label className="text-xs">簡易課税の事業区分（比較用）</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.jigyo} onChange={(e) => setV((s) => ({ ...s, jigyo: Number(e.target.value) }))}>
            {JIGYO.map((o) => <option key={o.id} value={o.id}>{o.label}・みなし仕入率 {o.rate * 100}%</option>)}
          </select>
        </div>
        <p className="text-xs text-muted-foreground">年の途中でインボイス登録した人は、登録日以後の売上を入れてください。給与収入は含めません。入力はこの端末にだけ保存されます。</p>
      </section>
      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">{v.year} 年分の消費税の納税額（{t ? t.label : `簡易課税・${j.label}`}）</p>
          <p className="mt-1 text-3xl font-bold">¥{yen(main.total)}</p>
          <p className="mt-1 text-sm text-muted-foreground">消費税 ¥{yen(main.kokuzei)} ＋ 地方消費税 ¥{yen(main.chiho)}／税込売上の約 {pct}%／期限 {deadline(v.year)}</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">計算方法</th><th className="pr-3 text-right">消費税</th><th className="pr-3 text-right">地方消費税</th><th className="text-right">納税額</th></tr></thead>
              <tbody>
                {compare.map((c) => (
                  <tr key={c.label} className="border-b border-slate-100">
                    <td className="py-1.5 pr-3">{c.label}</td>
                    <td className="pr-3 text-right tabular-nums">¥{yen(c.r.kokuzei)}</td>
                    <td className="pr-3 text-right tabular-nums">¥{yen(c.r.chiho)}</td>
                    <td className="text-right tabular-nums font-medium">¥{yen(c.r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 text-sm">
          <h3 className="font-semibold">{t?.id === 'niwari' ? '付表 6（簡易版）と申告書第一表に書く額（2 割特例）' : t ? '申告書に書く額の目安（3 割特例）' : `申告書に書く額（簡易課税・${j.label}）`}</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">欄</th><th className="pr-3 text-right">8% の分</th><th className="pr-3 text-right">10% の分</th><th className="text-right">合計</th></tr></thead>
              <tbody>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">課税資産の譲渡等の対価の額（税抜）</td><td className="pr-3 text-right tabular-nums">{yen(main.red.taika)}</td><td className="pr-3 text-right tabular-nums">{yen(main.std.taika)}</td><td className="text-right tabular-nums">{yen(main.red.taika + main.std.taika)}</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">課税標準額（1,000 円未満切り捨て）</td><td className="pr-3 text-right tabular-nums">{yen(main.red.hyojun)}</td><td className="pr-3 text-right tabular-nums">{yen(main.std.hyojun)}</td><td className="text-right tabular-nums">{yen(main.hyojun)}</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">消費税額（6.24%・7.8%）</td><td className="pr-3 text-right tabular-nums">{yen(main.red.tax)}</td><td className="pr-3 text-right tabular-nums">{yen(main.std.tax)}</td><td className="text-right tabular-nums">{yen(main.tax)}</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">返還等対価に係る税額</td><td className="pr-3 text-right tabular-nums">{yen(main.red.refundTax)}</td><td className="pr-3 text-right tabular-nums">{yen(main.std.refundTax)}</td><td className="text-right tabular-nums">{yen(main.refundTax)}</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">{t ? `特別控除税額（× ${t.rate * 100}%）＝ 控除対象仕入税額` : `控除対象仕入税額（× ${j.rate * 100}%）`}</td><td className="pr-3 text-right">—</td><td className="pr-3 text-right">—</td><td className="text-right tabular-nums">{yen(main.deduction)}</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">差引税額（100 円未満切り捨て）</td><td className="pr-3 text-right">—</td><td className="pr-3 text-right">—</td><td className="text-right tabular-nums">{yen(main.kokuzei)}</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">地方消費税（差引税額 × 22/78）</td><td className="pr-3 text-right">—</td><td className="pr-3 text-right">—</td><td className="text-right tabular-nums">{yen(main.chiho)}</td></tr>
              </tbody>
            </table>
          </div>
          {t?.id === 'niwari' && <p className="mt-2 text-xs text-muted-foreground">申告書第一表の「税額控除に係る経過措置の適用（2 割特例）」に ○ を付けます（事前の届出は不要）。</p>}
          {t?.id === 'sanwari' && <p className="mt-2 text-xs text-muted-foreground">3 割特例も事前の届出は不要で、申告書に適用を受ける旨を付記して選ぶ形です。2027 年分の申告書の様式は国税庁の案内で確認してください。</p>}
        </div>
        <div className="rounded-xl border bg-white p-5 text-sm">
          <h3 className="font-semibold">計算のメモ</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">{notes.map((n) => <li key={n}>{n}</li>)}</ul>
        </div>
      </section>
    </div>
  )
}
