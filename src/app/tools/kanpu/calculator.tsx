'use client'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { calcKanpu, withheldOf, type KanpuInputs } from '@/lib/kanpu'

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(n)
const KEY = 'fos.tool.kanpu'
const defaults: KanpuInputs = { sales: 3000000, expenses: 600000, aoiro: 650000, social: 500000, other: 0, withheld: 306300, yotei: 0 }

export function KanpuCalculator() {
  const [v, setV] = useState<KanpuInputs>(defaults)
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setV({ ...defaults, ...JSON.parse(s) }) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }, [v])
  const num = (k: keyof KanpuInputs) => (e: React.ChangeEvent<HTMLInputElement>) => setV((s) => ({ ...s, [k]: Number(e.target.value.replace(/[^\d]/g, '')) || 0 }))
  const r = calcKanpu(v)
  const refund = r.settle < 0
  const notes: string[] = []
  if (refund) notes.push('還付になる申告は、2027 年 1 月 1 日から提出できます（2 月 16 日を待つ必要はありません）。e-Tax なら 3 週間程度、書面なら 1 か月〜1 か月半で指定した口座に振り込まれます。')
  else if (r.settle > 0) notes.push('納める税金は 2027 年 3 月 15 日（月）が期限です。振替納税なら引き落としは 4 月下旬です。')
  if (v.withheld === 0) notes.push('源泉徴収税額が 0 円です。原稿料・デザイン料・講師料などで報酬から 10.21% 引かれていた人は、その 1 年分の合計を入れてください。')
  if (r.taxable === 0 && v.withheld > 0) notes.push('課税される所得が 0 円なので、源泉徴収された額が全額戻る計算です。')
  if (v.aoiro > 0) notes.push('青色申告特別控除は、青色申告の承認を受けている人だけが引けます。白色申告の人は 0 にしてください。')
  notes.push('住宅ローン控除などの税額控除、給与や年金などほかの所得、損失の繰越しは含みません。')
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">2026 年分（1 年分）</h2>
        <div><Label className="text-xs">売上（源泉徴収される前の額、税抜、円）</Label><Input inputMode="numeric" value={yen(v.sales)} onChange={num('sales')} /></div>
        <div><Label className="text-xs">経費（円）</Label><Input inputMode="numeric" value={yen(v.expenses)} onChange={num('expenses')} /></div>
        <div>
          <Label className="text-xs">青色申告特別控除</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.aoiro} onChange={(e) => setV((s) => ({ ...s, aoiro: Number(e.target.value) }))}>
            <option value={650000}>65 万円（e-Tax・優良な電子帳簿）</option>
            <option value={550000}>55 万円</option>
            <option value={100000}>10 万円</option>
            <option value={0}>なし（白色申告）</option>
          </select>
        </div>
        <div><Label className="text-xs">社会保険料（国民年金・国民健康保険など、1 年に払った額、円）</Label><Input inputMode="numeric" value={yen(v.social)} onChange={num('social')} /></div>
        <div><Label className="text-xs">ほかの所得控除（生命保険料・iDeCo・医療費・扶養など、円）</Label><Input inputMode="numeric" value={yen(v.other)} onChange={num('other')} /></div>
        <div>
          <Label className="text-xs">源泉徴収税額（1 年分の合計、円）</Label>
          <Input inputMode="numeric" value={yen(v.withheld)} onChange={num('withheld')} />
          <button type="button" className="mt-1 text-xs text-primary hover:underline" onClick={() => setV((s) => ({ ...s, withheld: withheldOf(s.sales) }))}>売上 × 10.21%（¥{yen(withheldOf(v.sales))}）を入れる</button>
        </div>
        <div><Label className="text-xs">予定納税額（7 月・11 月に払った額、円）</Label><Input inputMode="numeric" value={yen(v.yotei)} onChange={num('yotei')} /></div>
        <p className="text-xs text-muted-foreground">売上の一部だけが源泉徴収の対象なら、源泉徴収税額は請求書や入金の記録から集計した額を入れてください。入力はこの端末にだけ保存されます。</p>
      </section>
      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">{refund ? '確定申告で戻る所得税（還付）' : r.settle > 0 ? '確定申告で納める所得税' : '還付も納付もなし'}</p>
          <p className={`mt-1 text-3xl font-bold ${refund ? 'text-green-700' : ''}`}>¥{yen(Math.abs(r.settle))}</p>
          <p className="mt-1 text-sm text-muted-foreground">1 年分の所得税 ¥{yen(r.tax)}（復興特別所得税を含む）− 源泉徴収税額 ¥{yen(v.withheld)}{v.yotei > 0 ? ` − 予定納税額 ¥${yen(v.yotei)}` : ''}</p>
        </div>
        <div className="rounded-xl border bg-white p-5 text-sm">
          <h3 className="font-semibold">計算の内訳（申告書第一表の流れ）</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">売上 − 経費</td><td className="text-right tabular-nums">{yen(r.profit)}</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">− 青色申告特別控除</td><td className="text-right tabular-nums">{yen(r.aoiro)}</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">＝ 事業所得</td><td className="text-right tabular-nums">{yen(r.income)}</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">− 所得控除（社会保険料 ＋ 基礎控除 {yen(r.basic)} ＋ ほか）</td><td className="text-right tabular-nums">{yen(r.deductions)}</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">＝ 課税される所得金額（1,000 円未満切り捨て）</td><td className="text-right tabular-nums">{yen(r.taxable)}</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">所得税（税率 {Math.round(r.rate * 100)}%）</td><td className="text-right tabular-nums">{yen(r.it)}</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">＋ 復興特別所得税（2.1%）</td><td className="text-right tabular-nums">{yen(r.recon)}</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">− 源泉徴収税額</td><td className="text-right tabular-nums">{yen(v.withheld)}</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">＝ 申告納税額（黒字は 100 円未満切り捨て、赤字は △）</td><td className="text-right tabular-nums">{r.shinkoku < 0 ? `△${yen(-r.shinkoku)}` : yen(r.shinkoku)}</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">− 予定納税額</td><td className="text-right tabular-nums">{yen(v.yotei)}</td></tr>
                <tr><td className="py-1.5 pr-3 font-medium">{refund ? '還付される税金' : '納める税金'}</td><td className="text-right tabular-nums font-medium">{yen(Math.abs(r.settle))}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5 text-sm">
          <h3 className="font-semibold">計算のメモ</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">{notes.map((n) => <li key={n}>{n}</li>)}</ul>
        </div>
      </section>
    </div>
  )
}
