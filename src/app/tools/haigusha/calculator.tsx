'use client'
import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AOIRO_OPTIONS, HAIGUSHA_LIMIT, TOKUBETSU_FULL, TOKUBETSU_LIMIT, haigushaSaving, spouseIncome } from '@/lib/haigusha'

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(n)
const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })
const KEY = 'fos.tool.haigusha'
type In = { salary: number; sales: number; expenses: number; aoiro: number; spouseSalary: number; elderly: boolean }
const defaults: In = { salary: 6000000, sales: 2000000, expenses: 500000, aoiro: 650000, spouseSalary: 0, elderly: false }

export function HaigushaCalculator() {
  const [v, setV] = useState<In>(defaults)
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setV({ ...defaults, ...JSON.parse(s) }) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }, [v])
  const sp = useMemo(() => spouseIncome({ salary: v.spouseSalary, sales: v.sales, expenses: v.expenses, aoiro: v.aoiro }), [v])
  const r = useMemo(() => haigushaSaving(v.salary, sp.total, v.elderly), [v, sp])
  const num = (k: keyof In) => (e: React.ChangeEvent<HTMLInputElement>) => setV(s => ({ ...s, [k]: Number(e.target.value.replace(/[^\d]/g, '')) || 0 }))
  const kind = r.kind === 'haigusha' ? '配偶者控除' : r.kind === 'tokubetsu' ? '配偶者特別控除' : '対象外'
  // 給与がない場合に、今の申告方法で各区切りに収まる「売上 − 経費」の上限
  const room = (limit: number) => limit + v.aoiro
  const notes: string[] = []
  if (r.reason === 'self') notes.push('控除を受ける本人の合計所得が 1,000 万円を超えるため、配偶者控除・配偶者特別控除は受けられません。')
  if (sp.total <= HAIGUSHA_LIMIT) notes.push(`配偶者控除の対象です。配偶者の所得はあと ${man(HAIGUSHA_LIMIT - sp.total)} 万円増えても配偶者控除のまま、${man(TOKUBETSU_FULL - sp.total)} 万円増えるまでは配偶者特別控除で同じ控除額です。`)
  else if (sp.total <= TOKUBETSU_FULL) notes.push(`配偶者特別控除が満額です。配偶者の所得があと ${man(TOKUBETSU_FULL - sp.total)} 万円増えるまで控除額は変わりません。`)
  else if (sp.total <= TOKUBETSU_LIMIT) notes.push(`配偶者の所得が 95 万円を超えたため、控除額が段階的に減っています（133 万円を超えると 0 円）。`)
  if (sp.total <= 1040000) notes.push('配偶者自身の所得税は、所得 104 万円（2026 年分の基礎控除）以下なのでかかりません。')
  if (sp.total > 450000) notes.push('配偶者自身にも住民税がかかる可能性があります（住民税の基礎控除は 43 万円のまま。非課税の基準は自治体により所得 38 万〜45 万円）。')
  if (v.sales - v.expenses >= 1300000 || v.spouseSalary + v.sales >= 1300000) notes.push('健康保険の扶養に入っている場合は要確認: 一般的な基準は年収 130 万円未満で、個人事業主は売上や「売上 − 一部の経費」で判定され、青色申告特別控除は引けないのが一般的です。')
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">控除を受ける本人（会社員）</h2>
        <div><Label className="text-xs">年収（給与の額面、円）</Label><Input inputMode="numeric" value={yen(v.salary)} onChange={num('salary')} /></div>
        <h2 className="pt-2 text-sm font-semibold">配偶者（2026 年 1〜12 月の見込み）</h2>
        <div><Label className="text-xs">事業の売上（円）</Label><Input inputMode="numeric" value={yen(v.sales)} onChange={num('sales')} /></div>
        <div><Label className="text-xs">経費（円）</Label><Input inputMode="numeric" value={yen(v.expenses)} onChange={num('expenses')} /></div>
        <div>
          <Label className="text-xs">申告方法</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.aoiro} onChange={e => setV(s => ({ ...s, aoiro: Number(e.target.value) }))}>
            {AOIRO_OPTIONS.map((o) => <option key={o.aoiro} value={o.aoiro}>{o.label}</option>)}
          </select>
        </div>
        <div><Label className="text-xs">パートなどの給与（ある場合、年収・円）</Label><Input inputMode="numeric" value={yen(v.spouseSalary)} onChange={num('spouseSalary')} /></div>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={v.elderly} onChange={e => setV(s => ({ ...s, elderly: e.target.checked }))} />配偶者が 70 歳以上（2026 年 12 月 31 日時点）</label>
        <p className="text-xs text-muted-foreground">入力はこの端末にだけ保存されます。</p>
      </section>
      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">配偶者の合計所得金額</p>
          <p className="mt-1 text-3xl font-bold">¥{yen(sp.total)}</p>
          <p className="mt-1 text-xs text-muted-foreground">事業所得 ¥{yen(sp.biz)}（売上 − 経費 ¥{yen(sp.profit)} − 青色申告特別控除）{sp.kyuyo > 0 ? ` ＋ 給与所得 ¥${yen(sp.kyuyo)}` : ''}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-muted-foreground">受けられる控除</p><p className="mt-1 text-lg font-semibold">{kind}</p></div>
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-muted-foreground">控除額（所得税 / 住民税）</p><p className="mt-1 text-lg font-semibold">{man(r.it)} 万 / {man(r.res)} 万円</p></div>
            <div className="rounded-lg bg-green-50 p-3"><p className="text-xs text-muted-foreground">本人の税金が下がる額（年）</p><p className="mt-1 text-lg font-semibold text-green-700">約 ¥{yen(r.total)}</p></div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">所得税 ¥{yen(r.incomeTax)}（2026 年分の年末調整）＋ 住民税 ¥{yen(r.residentTax)}（2027 年度分）。</p>
        </div>
        <div className="rounded-xl border bg-white p-5 text-sm">
          <h3 className="font-semibold">判定のメモ</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">{notes.map((n) => <li key={n}>{n}</li>)}</ul>
          {sp.kyuyo === 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              {AOIRO_OPTIONS.find((o) => o.aoiro === v.aoiro)?.label}の場合、配偶者の「売上 − 経費」の目安: 配偶者控除 {man(room(HAIGUSHA_LIMIT))} 万円以下 ／ 満額 38 万円 {man(room(TOKUBETSU_FULL))} 万円以下 ／ 配偶者特別控除 {man(room(TOKUBETSU_LIMIT))} 万円以下。
            </p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">2026 年分。本人は会社員、社会保険料は年収の 15%、ほかの所得控除なしで概算（住民税の調整控除の差は含みません）。配偶者に青色事業専従者給与を払っている場合は対象外です。</p>
        </div>
      </section>
    </div>
  )
}
