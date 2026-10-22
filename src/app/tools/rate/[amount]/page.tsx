import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { SITE_URL } from '@/lib/site'
import { calc, requiredSalesFor, RATE_TARGETS as AMOUNTS } from '@/lib/takehome'

// 目標手取り別の必要売上・時間単価ページ。時間単価ツールと同じ前提（年間 1,152 時間請求）でビルド時に算出する。
export const dynamicParams = false

const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })
const yen = (n: number) => Math.round(n).toLocaleString('ja-JP')
const BILLABLE = 40 * 48 * 0.6 // 週 40 時間 × 48 週 × 請求できる割合 60% ＝ 1,152 時間

function figures(target: number) {
  const t = target * 10000
  const sales = requiredSalesFor(t, { expenses: 600000 })
  const d = calc({ sales, expenses: 600000, aoiro: 650000, other: 0, withheld: 0, taxable: false, bizRate: 0, nhiRate: 0.1 })
  const hourly = Math.ceil(sales / BILLABLE / 100) * 100
  const byHours = [900, 1152, 1500, 1800].map((h) => ({ h, hourly: Math.ceil(sales / h / 100) * 100 }))
  const byExpense = [0.1, 0.2, 0.3].map((e) => ({ e, sales: requiredSalesFor(t, { expenseRate: e }) }))
  const invoice2 = requiredSalesFor(t, { expenses: 600000, taxable: true, ctRate: 0.2 })
  const invoice3 = requiredSalesFor(t, { expenses: 600000, taxable: true, ctRate: 0.3 })
  return { t, sales, d, hourly, byHours, byExpense, invoice2, invoice3 }
}

export function generateStaticParams() {
  return AMOUNTS.map((a) => ({ amount: String(a) }))
}

export function generateMetadata({ params }: { params: { amount: string } }): Metadata {
  const a = Number(params.amount)
  if (!AMOUNTS.includes(a)) return {}
  const { sales, hourly } = figures(a)
  const title = `フリーランスで手取り${a.toLocaleString('ja-JP')}万円に必要な売上は約${man(sales)}万円・時給${yen(hourly)}円【2026年分】| FreelanceOS`
  const description = `フリーランス・個人事業主が手取り ${a.toLocaleString('ja-JP')} 万円を得るには、売上 約 ${man(sales)} 万円（月 約 ${man(sales / 12)} 万円）、時間単価 約 ${yen(hourly)} 円が必要（経費 60 万円・青色申告・独身）。稼働時間別・経費率別の必要額、インボイス登録した場合も試算。`
  return {
    title,
    description,
    alternates: { canonical: `/tools/rate/${a}` },
    openGraph: { title, description, type: 'article', locale: 'ja_JP', images: [{ url: '/blog/og/tools-rate.png', width: 1200, height: 630 }] },
  }
}

export default function RateTargetPage({ params }: { params: { amount: string } }) {
  const a = Number(params.amount)
  if (!AMOUNTS.includes(a)) notFound()
  const { sales, d, hourly, byHours, byExpense, invoice2, invoice3 } = figures(a)
  const label = `${a.toLocaleString('ja-JP')}万円`
  const idx = AMOUNTS.indexOf(a)
  const prev = AMOUNTS[idx - 1]
  const next = AMOUNTS[idx + 1]
  const faqs = [
    { q: `フリーランスで手取り${label}にするには月いくら売り上げればいい？`, a: `経費 60 万円、青色申告特別控除 65 万円、独身の場合、年間の売上 約 ${man(sales)} 万円、月あたり 約 ${man(sales / 12)} 万円が必要です。このうち税金と社会保険料（所得税・住民税・国民健康保険・国民年金）が 約 ${man(d.taxes + d.social)} 万円かかります。` },
    { q: '時間単価はどう決めればいい？', a: `年間に請求できる時間で必要な売上を割ります。週 40 時間 × 48 週働いても、営業・事務・学習などを除いて請求できるのは 6 割程度（約 1,152 時間）なので、時間単価は 約 ${yen(hourly)} 円、1 日 8 時間なら日単価 約 ${yen(hourly * 8)} 円が目安です。請求できる時間が少ないほど、必要な単価は上がります。` },
    { q: '会社員の年収と同じ額を稼げば同じ暮らしができる？', a: 'できません。会社員は社会保険料の半分を会社が負担し、交通費・設備・有給休暇・賞与・退職金もあります。フリーランスは保険料を全額負担し、経費や休業のリスクも自分で持つため、同じ手取りを得るには会社員の年収より高い売上が必要です。' },
  ]
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="text-xs text-muted-foreground"><Link href="/tools" className="hover:underline">無料ツール</Link> › <Link href="/tools/rate" className="hover:underline">時間単価計算</Link> › 手取り{label}</nav>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">フリーランスで手取り{label}に必要な売上と時間単価は？【2026年分】</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-muted-foreground">必要な売上（年）</p><p className="mt-1 text-2xl font-bold">約 {man(sales)} 万円</p><p className="text-xs text-muted-foreground">月 約 {man(sales / 12)} 万円</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-muted-foreground">時間単価</p><p className="mt-1 text-2xl font-bold">約 {yen(hourly)} 円</p><p className="text-xs text-muted-foreground">年 1,152 時間請求の場合</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-muted-foreground">日単価（8 時間）</p><p className="mt-1 text-2xl font-bold">約 {yen(hourly * 8)} 円</p><p className="text-xs text-muted-foreground">経費 60 万円・青色申告・独身</p></div>
        </div>

        <h2 className="mt-10 text-xl font-bold">内訳</h2>
        <table className="mt-3 w-full text-sm">
          <tbody>
            <Row k="必要な売上" v={`${man(sales)} 万円`} bold />
            <Row k="経費" v={`−60 万円`} />
            <Row k="所得税（復興特別所得税込み）" v={`−${man(d.incomeTax)} 万円`} />
            <Row k="住民税" v={`−${man(d.residentTax)} 万円`} />
            <Row k="国民健康保険（概算）" v={`−${man(d.nhi)} 万円`} />
            <Row k="国民年金" v={`−${man(d.pension)} 万円`} />
            <Row k="手取り" v={`${man(d.takeHome)} 万円`} bold />
          </tbody>
        </table>

        <h2 className="mt-10 text-xl font-bold">請求できる時間別の時間単価</h2>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">年間の請求時間</th><th>目安</th><th>必要な時間単価</th><th>日単価（8 時間）</th></tr></thead>
            <tbody>
              {byHours.map(({ h, hourly: x }) => (
                <tr key={h} className="border-b border-slate-100">
                  <td className="py-1.5 tabular-nums">{yen(h)} 時間</td>
                  <td className="text-xs text-muted-foreground">{h === 900 ? '週 25 時間程度' : h === 1152 ? '週 40 時間 × 6 割' : h === 1500 ? '週 40 時間 × 8 割' : '週 40 時間 × ほぼ全部'}</td>
                  <td className="tabular-nums font-semibold">{yen(x)} 円</td>
                  <td className="tabular-nums">{yen(x * 8)} 円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl font-bold">経費率別の必要な売上</h2>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">経費率</th><th>必要な売上（年）</th><th>月あたり</th></tr></thead>
            <tbody>
              {byExpense.map(({ e, sales: x }) => (
                <tr key={e} className="border-b border-slate-100"><td className="py-1.5">{Math.round(e * 100)}%</td><td className="tabular-nums font-semibold">{man(x)} 万円</td><td className="tabular-nums">{man(x / 12)} 万円</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl font-bold">インボイス登録した場合</h2>
        <p className="mt-2 text-sm leading-relaxed">消費税を上乗せして請求しても、納める消費税の分だけ手取りが減ります。同じ手取りに必要な税抜売上は、2026 年分（2 割特例）で 約 {man(invoice2)} 万円、2027・2028 年分（3 割特例）で 約 {man(invoice3)} 万円です。</p>

        <div className="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm">
          <p className="font-semibold">自分の条件で逆算する</p>
          <p className="mt-1 text-muted-foreground">時間単価計算ツール（無料・登録不要）で、目標の手取り・経費・稼働時間・請求できる割合を変えて計算できます。</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/tools/rate" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">時間単価計算ツールを開く</Link>
            <Link href="/blog/freelance-hourly-rate" className="inline-flex h-9 items-center rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary hover:bg-primary hover:text-white">単価の決め方を読む</Link>
          </div>
        </div>

        <ToolFaq items={faqs} />

        <MoreTools current="/tools/rate" />

        <section className="mt-10 text-sm">
          <h2 className="text-base font-semibold">ほかの目標手取り</h2>
          <div className="mt-2 flex justify-between">
            {prev ? <Link href={`/tools/rate/${prev}`} className="text-primary hover:underline">← 手取り {prev.toLocaleString('ja-JP')} 万円</Link> : <span />}
            {next ? <Link href={`/tools/rate/${next}`} className="text-primary hover:underline">手取り {next.toLocaleString('ja-JP')} 万円 →</Link> : <span />}
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {AMOUNTS.map((x) => (
              <li key={x}><Link href={`/tools/rate/${x}`} className={`inline-block rounded border px-2 py-1 text-xs ${x === a ? 'border-primary bg-primary/10 font-semibold' : 'hover:bg-slate-50'}`}>手取り {x.toLocaleString('ja-JP')}万円</Link></li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">前提: 2026 年分。経費 60 万円（経費率別の表を除く）、青色申告特別控除 65 万円、独身、国保は（所得 − 43 万円）× 10% ＋ 均等割 6 万円（上限 109 万円）、国民年金 月 17,920 円、個人事業税なし。概算です。<Link href="/tools/hayamihyo" className="text-primary hover:underline">売上別の手取り早見表はこちら</Link>。</p>
        </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '無料ツール', item: `${SITE_URL}/tools` }, { '@type': 'ListItem', position: 2, name: '時間単価計算', item: `${SITE_URL}/tools/rate` }, { '@type': 'ListItem', position: 3, name: `手取り${label}`, item: `${SITE_URL}/tools/rate/${a}` }] }) }} />
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
