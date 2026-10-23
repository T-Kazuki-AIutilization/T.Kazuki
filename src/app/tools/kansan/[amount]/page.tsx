import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { ExcelUpsell } from '@/components/marketing/excel-upsell'
import { SITE_URL } from '@/lib/site'
import { calc, requiredSalesFor } from '@/lib/takehome'
import { employeeTakeHome, KANSAN_SALARIES as AMOUNTS } from '@/lib/fukugyo'

// 会社員の年収をフリーランスの売上に換算するページ。同じ手取りになる売上を、手取りツールと同じ計算式で逆算する。
export const dynamicParams = false

const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })
const yen = (n: number) => Math.round(n).toLocaleString('ja-JP')

function figures(amount: number) {
  const salary = amount * 10000
  const emp = employeeTakeHome(salary)
  const sales = requiredSalesFor(emp.takeHome, { expenses: 600000 })
  const d = calc({ sales, expenses: 600000, aoiro: 650000, other: 0, withheld: 0, taxable: false, bizRate: 0, nhiRate: 0.1 })
  const byExpense = [0.1, 0.2, 0.3].map((e) => ({ e, sales: requiredSalesFor(emp.takeHome, { expenseRate: e }) }))
  const white = requiredSalesFor(emp.takeHome, { expenses: 600000, aoiro: 0 })
  return { salary, emp, sales, d, byExpense, white }
}

export function generateStaticParams() {
  return AMOUNTS.map((a) => ({ amount: String(a) }))
}

export function generateMetadata({ params }: { params: { amount: string } }): Metadata {
  const a = Number(params.amount)
  if (!AMOUNTS.includes(a)) return {}
  const { emp, sales } = figures(a)
  const title = `年収${a}万円の会社員と同じ手取りにするには、フリーランスの売上は約${man(sales)}万円【2026年分】| FreelanceOS`
  const description = `年収 ${a} 万円の会社員の手取りは約 ${man(emp.takeHome)} 万円。フリーランス・個人事業主が同じ手取りを得るには売上 約 ${man(sales)} 万円（月 約 ${man(sales / 12)} 万円）が必要（経費 60 万円・青色申告・独身）。差が出る理由、経費率別、時間単価・月単価への換算。`
  return {
    title,
    description,
    alternates: { canonical: `/tools/kansan/${a}` },
    openGraph: { title, description, type: 'article', locale: 'ja_JP', images: [{ url: '/blog/og/tools-rate.png', width: 1200, height: 630 }] },
  }
}

export default function KansanPage({ params }: { params: { amount: string } }) {
  const a = Number(params.amount)
  if (!AMOUNTS.includes(a)) notFound()
  const { salary, emp, sales, d, byExpense, white } = figures(a)
  const label = `${a}万円`
  const idx = AMOUNTS.indexOf(a)
  const prev = AMOUNTS[idx - 1]
  const next = AMOUNTS[idx + 1]
  const hourly = Math.ceil(sales / 1152 / 100) * 100
  const faqs = [
    { q: `年収${label}の会社員の手取りはいくら？`, a: `独身・扶養なしで、社会保険料（健康保険・厚生年金・雇用保険）を年収の約 15% として計算すると、社会保険料 約 ${man(emp.social)} 万円、所得税 約 ${man(emp.incomeTax)} 万円、住民税 約 ${man(emp.residentTax)} 万円を引いて、手取りは 約 ${man(emp.takeHome)} 万円です。` },
    { q: 'なぜフリーランスは会社員の年収より多く売り上げる必要があるの？', a: '会社員は社会保険料の半分を会社が負担し、仕事に使う PC・交通費・オフィスも会社持ちです。フリーランスは国民健康保険と国民年金を全額自分で払い、経費も売上から出します。さらに有給休暇・賞与・退職金がなく、将来の年金も厚生年金の上乗せがないため、同じ手取りでも実質的な保障は小さくなります。' },
    { q: `売上 約${man(sales)}万円は月単価や時給にするといくら？`, a: `月あたり 約 ${man(sales / 12)} 万円です。週 40 時間 × 48 週働き、そのうち 6 割（約 1,152 時間）を請求できるとすると、時間単価は 約 ${yen(hourly)} 円、日単価（8 時間）は 約 ${yen(hourly * 8)} 円が目安です。` },
  ]
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="text-xs text-muted-foreground"><Link href="/tools" className="hover:underline">無料ツール</Link> › <Link href="/tools/rate" className="hover:underline">時間単価計算</Link> › 年収{label}の会社員と比較</nav>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">年収{label}の会社員と同じ手取りにするには、フリーランスの売上はいくら必要？【2026年分】</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-muted-foreground">会社員 年収 {label} の手取り</p><p className="mt-1 text-2xl font-bold">約 {man(emp.takeHome)} 万円</p><p className="text-xs text-muted-foreground">社会保険料 約 {man(emp.social)} 万・所得税 約 {man(emp.incomeTax)} 万・住民税 約 {man(emp.residentTax)} 万</p></div>
          <div className="rounded-xl border border-primary/40 bg-white p-4"><p className="text-xs text-muted-foreground">フリーランスで同じ手取りに必要な売上</p><p className="mt-1 text-2xl font-bold">約 {man(sales)} 万円</p><p className="text-xs text-muted-foreground">月 約 {man(sales / 12)} 万円・年収の {Math.round((sales / salary) * 100)}%</p></div>
        </div>

        <h2 className="mt-10 text-xl font-bold">フリーランス側の内訳（経費 60 万円・青色申告 65 万円控除・独身）</h2>
        <table className="mt-3 w-full text-sm">
          <tbody>
            <Row k="売上" v={`${man(sales)} 万円`} bold />
            <Row k="経費" v="−60 万円" />
            <Row k="所得税（復興特別所得税込み）" v={`−${man(d.incomeTax)} 万円`} />
            <Row k="住民税" v={`−${man(d.residentTax)} 万円`} />
            <Row k="国民健康保険（概算）" v={`−${man(d.nhi)} 万円`} />
            <Row k="国民年金" v={`−${man(d.pension)} 万円`} />
            <Row k="手取り" v={`${man(d.takeHome)} 万円`} bold />
          </tbody>
        </table>

        <h2 className="mt-10 text-xl font-bold">条件別の必要な売上</h2>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">条件</th><th>必要な売上（年）</th><th>月あたり</th></tr></thead>
            <tbody>
              {byExpense.map(({ e, sales: x }) => (
                <tr key={e} className="border-b border-slate-100"><td className="py-1.5">経費率 {Math.round(e * 100)}%・青色 65 万円</td><td className="tabular-nums font-semibold">{man(x)} 万円</td><td className="tabular-nums">{man(x / 12)} 万円</td></tr>
              ))}
              <tr className="border-b border-slate-100"><td className="py-1.5">経費 60 万円・白色申告</td><td className="tabular-nums font-semibold">{man(white)} 万円</td><td className="tabular-nums">{man(white / 12)} 万円</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">ここで比べているのは「その年の手取り」だけです。会社員の有給休暇・賞与・退職金・厚生年金の上乗せ・会社負担の福利厚生まで含めて同等にしたい場合は、さらに 1〜2 割ほど上乗せした売上を目標にするのが無難です。</p>

        <div className="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm">
          <p className="font-semibold">自分の条件で計算する</p>
          <p className="mt-1 text-muted-foreground">目標の手取りから必要な売上と時間単価を逆算するなら時間単価計算ツール、売上から手取りを出すなら手取り計算シミュレーター（どちらも無料・登録不要）。</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/tools/rate" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">時間単価計算ツール</Link>
            <Link href="/tools/takehome" className="inline-flex h-9 items-center rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary hover:bg-primary hover:text-white">手取り計算シミュレーター</Link>
          </div>
        </div>

        <ExcelUpsell item="rate" />
        <ToolFaq items={faqs} />

        <section className="mt-10 text-sm">
          <h2 className="text-base font-semibold">ほかの年収で比べる</h2>
          <div className="mt-2 flex justify-between">
            {prev ? <Link href={`/tools/kansan/${prev}`} className="text-primary hover:underline">← 年収 {prev} 万円</Link> : <span />}
            {next ? <Link href={`/tools/kansan/${next}`} className="text-primary hover:underline">年収 {next} 万円 →</Link> : <span />}
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {AMOUNTS.map((x) => (
              <li key={x}><Link href={`/tools/kansan/${x}`} className={`inline-block rounded border px-2 py-1 text-xs ${x === a ? 'border-primary bg-primary/10 font-semibold' : 'hover:bg-slate-50'}`}>年収 {x}万円</Link></li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">前提: 2026 年分、独身・扶養なし。会社員は給与所得控除（2025 年改正後）、社会保険料を年収の 15% で概算。フリーランスは国保を（所得 − 43 万円）× 10% ＋ 均等割 6 万円（上限 109 万円）、国民年金 月 17,920 円、個人事業税・消費税なし。概算です。</p>
        </section>
        <MoreTools current="/tools/rate" />
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '無料ツール', item: `${SITE_URL}/tools` }, { '@type': 'ListItem', position: 2, name: '時間単価計算', item: `${SITE_URL}/tools/rate` }, { '@type': 'ListItem', position: 3, name: `年収${label}の会社員と比較`, item: `${SITE_URL}/tools/kansan/${a}` }] }) }} />
    </SiteShell>
  )
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <tr className={`border-b border-slate-100 ${bold ? 'font-semibold' : ''}`}>
      <td className="py-1.5">{k}</td>
      <td className="py-1.5 text-right tabular-nums">{v}</td>
    </tr>
  )
}
