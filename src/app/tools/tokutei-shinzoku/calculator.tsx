'use client'
import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AOIRO_OPTIONS } from '@/lib/haigusha'
import { FUYO_LIMIT, TOKUTEI_FULL, TOKUTEI_LIMIT, childIncome, tokuteiSaving } from '@/lib/tokutei'

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(n)
const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })
const KEY = 'fos.tool.tokutei'
type In = { salary: number; childSalary: number; sales: number; expenses: number; aoiro: number }
const defaults: In = { salary: 6000000, childSalary: 600000, sales: 900000, expenses: 100000, aoiro: 0 }

export function TokuteiCalculator() {
  const [v, setV] = useState<In>(defaults)
  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setV({ ...defaults, ...JSON.parse(s) }) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {} }, [v])
  const c = useMemo(() => childIncome({ salary: v.childSalary, sales: v.sales, expenses: v.expenses, aoiro: v.aoiro }), [v])
  const r = useMemo(() => tokuteiSaving(v.salary, c.total), [v, c])
  const full = useMemo(() => tokuteiSaving(v.salary, 0), [v])
  const num = (k: keyof In) => (e: React.ChangeEvent<HTMLInputElement>) => setV(s => ({ ...s, [k]: Number(e.target.value.replace(/[^\d]/g, '')) || 0 }))
  const kind = r.kind === 'fuyo' ? '特定扶養控除' : r.kind === 'tokutei' ? '特定親族特別控除' : '対象外'
  const notes: string[] = []
  if (c.total <= FUYO_LIMIT) notes.push(`特定扶養控除（扶養控除等申告書に記入）の対象です。子の所得はあと ${man(TOKUTEI_FULL - c.total)} 万円増えるまで、親の控除は 63 万円のままです（62 万円を超えると特定親族特別控除に切り替わります）。`)
  else if (c.total <= TOKUTEI_FULL) notes.push(`特定親族特別控除が満額の 63 万円です。子の所得があと ${man(TOKUTEI_FULL - c.total)} 万円増えるまで控除額は変わりません。`)
  else if (c.total <= TOKUTEI_LIMIT) notes.push(`子の所得が 85 万円を超えたため、控除額が段階的に減っています（123 万円を超えると 0 円）。満額のときより親の税金が年 約 ¥${yen(full.total - r.total)} 増えます。`)
  else notes.push(`子の所得が 123 万円を超えているため、親の特定扶養控除・特定親族特別控除はありません。満額のときより親の税金が年 約 ¥${yen(full.total - r.total)} 増えます。`)
  if (c.biz > 0) notes.push('業務委託の報酬は「売上 − 経費」がそのまま所得になります（アルバイトのような給与所得控除はありません）。仕事に使った支出は経費として漏れなく引きましょう。')
  if (c.total > 1040000) notes.push('子自身にも所得税がかかります（2026 年分の基礎控除 104 万円を超えるため）。確定申告が必要です。')
  else if (c.biz > 0) notes.push('子自身の所得税は、所得 104 万円（2026 年分の基礎控除）以下なのでかかりません。報酬から源泉徴収されていれば、確定申告で戻ってくることが多いです。')
  if (v.childSalary + v.sales >= 1500000) notes.push('親の健康保険の扶養に入っている場合は要確認: 19〜22 歳の子は年間収入 150 万円未満が基準です（2025 年 10 月から）。業務委託の収入の数え方は健康保険組合ごとに異なります。')
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">控除を受ける親（会社員）</h2>
        <div><Label className="text-xs">年収（給与の額面、円）</Label><Input inputMode="numeric" value={yen(v.salary)} onChange={num('salary')} /></div>
        <h2 className="pt-2 text-sm font-semibold">19〜22 歳の子（2026 年 1〜12 月の見込み）</h2>
        <div><Label className="text-xs">アルバイトの給与（年収・円）</Label><Input inputMode="numeric" value={yen(v.childSalary)} onChange={num('childSalary')} /></div>
        <div><Label className="text-xs">業務委託・フリーランスの売上（円）</Label><Input inputMode="numeric" value={yen(v.sales)} onChange={num('sales')} /></div>
        <div><Label className="text-xs">業務委託の経費（円）</Label><Input inputMode="numeric" value={yen(v.expenses)} onChange={num('expenses')} /></div>
        <div>
          <Label className="text-xs">業務委託の申告方法</Label>
          <select className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={v.aoiro} onChange={e => setV(s => ({ ...s, aoiro: Number(e.target.value) }))}>
            {AOIRO_OPTIONS.map((o) => <option key={o.aoiro} value={o.aoiro}>{o.aoiro === 0 ? '白色申告・雑所得（開業届なし）' : o.label}</option>)}
          </select>
        </div>
        <p className="text-xs text-muted-foreground">2026 年 12 月 31 日時点で 19〜22 歳（2004 年 1 月 2 日〜2008 年 1 月 1 日生まれ）の子が対象。入力はこの端末にだけ保存されます。</p>
      </section>
      <section className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">子の合計所得金額</p>
          <p className="mt-1 text-3xl font-bold">¥{yen(c.total)}</p>
          <p className="mt-1 text-xs text-muted-foreground">給与所得 ¥{yen(c.kyuyo)}（年収 − 給与所得控除 最低 74 万円）＋ 業務委託の所得 ¥{yen(c.biz)}（売上 − 経費{v.aoiro > 0 ? ' − 青色申告特別控除' : ''}）</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-muted-foreground">親が受けられる控除</p><p className="mt-1 text-lg font-semibold">{kind}</p></div>
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-muted-foreground">控除額（所得税 / 住民税）</p><p className="mt-1 text-lg font-semibold">{man(r.it)} 万 / {man(r.res)} 万円</p></div>
            <div className="rounded-lg bg-green-50 p-3"><p className="text-xs text-muted-foreground">親の税金が下がる額（年）</p><p className="mt-1 text-lg font-semibold text-green-700">約 ¥{yen(r.total)}</p></div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">所得税 ¥{yen(r.incomeTax)}（2026 年分の年末調整）＋ 住民税 ¥{yen(r.residentTax)}（2027 年度分）。</p>
        </div>
        <div className="rounded-xl border bg-white p-5 text-sm">
          <h3 className="font-semibold">判定のメモ</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">{notes.map((n) => <li key={n}>{n}</li>)}</ul>
          <p className="mt-3 text-xs text-muted-foreground">
            控除が満額のままの目安: 子の所得 85 万円以下 ＝ アルバイトだけなら年収 159 万円以下、業務委託だけなら{v.aoiro > 0 ? ` 売上 − 経費 ${man(TOKUTEI_FULL + v.aoiro)} 万円以下（青色申告特別控除を含む）` : ' 売上 − 経費 85 万円以下'}。
          </p>
          <p className="mt-3 text-xs text-muted-foreground">2026 年分。親は会社員、社会保険料は年収の 15%、ほかの所得控除なしで概算（住民税の調整控除の差は含みません）。親の事業の事業専従者として給与を受けている子は対象外です。</p>
        </div>
      </section>
    </div>
  )
}
