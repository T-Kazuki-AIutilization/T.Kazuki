'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { furusatoLimit, floor, type FurusatoInputs } from '@/lib/takehome'
import { furusatoEmployee } from '@/lib/fukugyo'

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(n)

const KEY = 'fos.tool.furusato'
type Inputs = FurusatoInputs & { kind: 'freelance' | 'employee'; salary: number; side: number }
const defaults: Inputs = { kind: 'freelance', sales: 5000000, expenses: 600000, aoiro: 650000, other: 0, nhiRate: 0.1, salary: 5000000, side: 0 }

export function FurusatoCalculator() {
  const [v, setV] = useState<Inputs>(defaults)
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setV({ ...defaults, ...JSON.parse(s) }) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }, [v])
  const emp = v.kind === 'employee'
  const r = useMemo(() => (emp ? furusatoEmployee(v.salary, v.side, v.other) : furusatoLimit(v)), [v, emp])
  const num = (k: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) => setV(s => ({ ...s, [k]: Number(e.target.value.replace(/[^\d]/g, '')) || 0 }))
  const safe = floor(r.limit * 0.9, 1000)

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">入力（2026 年の見込み・年間{emp ? '' : '・税抜'}）</h2>
        <div className="flex gap-2 text-sm">
          {(['freelance', 'employee'] as const).map(k => (
            <button key={k} type="button" onClick={() => setV(s => ({ ...s, kind: k }))} className={`flex-1 rounded-md border px-3 py-2 ${v.kind === k ? 'border-primary bg-primary/10 font-semibold text-primary' : 'hover:bg-slate-50'}`}>{k === 'freelance' ? 'フリーランス' : '会社員（副業も可）'}</button>
          ))}
        </div>
        {emp ? (
          <>
            <div><Label className="text-xs">会社の年収（額面・円）</Label><Input inputMode="numeric" value={yen(v.salary)} onChange={num('salary')} /></div>
            <div><Label className="text-xs">副業の所得（売上 − 経費・円、なければ 0）</Label><Input inputMode="numeric" value={yen(v.side)} onChange={num('side')} /></div>
          </>
        ) : (<>
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
        </>)}
        <p className="text-xs text-muted-foreground">{emp ? '社会保険料（健康保険・厚生年金・雇用保険）は年収の 15% で概算して控除に含めます。' : '国民年金・国民健康保険は自動で社会保険料控除に含めます。'}入力はこの端末にだけ保存されます。</p>
      </section>

      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">自己負担 2,000 円で済む寄附額の上限（目安）</p>
          <p className="mt-1 text-4xl font-bold">¥{yen(r.limit)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{emp ? '年収は年末の賞与などで変わるため' : '売上は年末まで確定しないため'}、安全に寄附するなら目安の 9 割（¥{yen(safe)}）程度までがおすすめです。</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h2 className="text-sm font-semibold">計算の内訳</h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              <Row label={emp ? '所得（給与所得＋副業の所得）' : '事業所得（青色控除後）'} v={`¥${yen(r.income)}`} />
              <Row label={emp ? '社会保険料控除（年収の 15% で概算）' : '社会保険料控除（国民年金＋国保の概算）'} v={`¥${yen(r.social)}`} />
              <Row label="住民税の課税所得" v={`¥${yen(r.taxableRes)}`} />
              <Row label="住民税の所得割額（10%、調整控除後）" v={`¥${yen(r.shotokuwari)}`} />
              <Row label="所得税の税率（特例控除の判定用）" v={`${Math.round(r.rate * 100)}%`} />
              <Row label="上限額 ＝ 所得割 × 20% ÷（90% − 税率 × 1.021）＋ 2,000 円" v={`¥${yen(r.limit)}`} bold />
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">
            2026 年中の寄附は 2026 年分の所得で判定されます。配偶者・扶養控除、医療費控除、住宅ローン控除{emp ? '' : '、給与など事業以外の所得'}は含みません（住宅ローン控除を使う人は上限が下がることがあります）。{emp ? <>副業の所得があると確定申告または住民税の申告が必要になり、ワンストップ特例は無効になります（<Link href="/blog/side-job-furusato-nozei" className="text-primary hover:underline">副業がある会社員のふるさと納税</Link>）。</> : 'フリーランスは確定申告をするため、ワンストップ特例は使えず、確定申告で寄附金控除を申告します。'}
          </p>
        </div>
        {emp ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm">
            <p className="font-semibold">副業でいくら税金が増える？</p>
            <p className="mt-1 text-muted-foreground">副業の売上・経費から、増える所得税・住民税と手元に残る額を計算できます（無料・登録不要）。</p>
            <div className="mt-3"><Link href="/tools/fukugyo" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">副業の税金計算ツール</Link></div>
          </div>
        ) : (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm">
          <p className="font-semibold">年末に売上の着地を確認してから寄附する</p>
          <p className="mt-1 text-muted-foreground">FreelanceOS なら案件ごとの売上と入金をダッシュボードで集計できます。12 月の時点の年間売上の見込みがすぐわかります。</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/signup" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">FreelanceOS を無料ではじめる</Link> <Link href="/demo" className="ml-3 inline-flex h-9 items-center text-sm text-primary hover:underline">デモ画面を見る</Link>
            <Link href="/tools/takehome" className="inline-flex h-9 items-center rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary hover:bg-primary hover:text-white">手取りも計算する</Link>
          </div>
        </div>
        )}
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
