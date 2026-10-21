import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { SITE_URL } from '@/lib/site'
import { calc, MONTHLY_AMOUNTS as AMOUNTS, type Inputs } from '@/lib/takehome'

// 月単価別の手取りページ（フリーランスエンジニアなど月額契約向け）。ツールと同じ計算式でビルド時に算出する。
export const dynamicParams = false

const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })
const base = (sales: number, expenseRate = 0.1): Inputs => ({ sales, expenses: Math.round(sales * expenseRate), aoiro: 650000, other: 0, withheld: 0, taxable: false, bizRate: 0, nhiRate: 0.1 })

function figures(monthly: number) {
  const sales = monthly * 10000 * 12
  const r = calc(base(sales))
  const rate = Math.round((r.takeHome / sales) * 1000) / 10
  const byMonths = [12, 11, 10].map((m) => ({ m, r: calc(base(monthly * 10000 * m)) }))
  const byExpense = [0.05, 0.1, 0.2].map((e) => ({ e, r: calc(base(sales, e)) }))
  const overThreshold = sales > 10000000
  const ct = overThreshold ? calc({ ...base(sales), taxable: true, ctRate: 0.5 }) : null
  const ct2 = calc({ ...base(sales), taxable: true, ctRate: 0.2 })
  const ct3 = calc({ ...base(sales), taxable: true, ctRate: 0.3 })
  const biz = calc({ ...base(sales), bizRate: 0.05 })
  return { sales, r, rate, byMonths, byExpense, overThreshold, ct, ct2, ct3, biz }
}

export function generateStaticParams() {
  return AMOUNTS.map((a) => ({ amount: String(a) }))
}

export function generateMetadata({ params }: { params: { amount: string } }): Metadata {
  const a = Number(params.amount)
  if (!AMOUNTS.includes(a)) return {}
  const { r } = figures(a)
  const title = `月単価${a}万円のフリーランスの手取りは月約${man(r.takeHome / 12)}万円（年${man(r.takeHome)}万円）【2026年分】| FreelanceOS`
  const description = `月単価 ${a} 万円（年商 ${man(a * 120000)} 万円）のフリーランスエンジニア・個人事業主の手取りは年 約 ${man(r.takeHome)} 万円、月 約 ${man(r.takeHome / 12)} 万円（経費率 10%・青色申告・独身）。税金・国保・年金の内訳、案件が途切れた場合、インボイス登録時の消費税まで試算。`
  return {
    title,
    description,
    alternates: { canonical: `/tools/takehome/monthly/${a}` },
    openGraph: { title, description, type: 'article', locale: 'ja_JP', images: [{ url: '/blog/og/tools-takehome.png', width: 1200, height: 630 }] },
  }
}

export default function MonthlyTakeHomePage({ params }: { params: { amount: string } }) {
  const a = Number(params.amount)
  if (!AMOUNTS.includes(a)) notFound()
  const { sales, r, rate, byMonths, byExpense, overThreshold, ct, ct2, ct3, biz } = figures(a)
  const label = `${a}万円`
  const idx = AMOUNTS.indexOf(a)
  const prev = AMOUNTS[idx - 1]
  const next = AMOUNTS[idx + 1]
  const faqs = [
    { q: `月単価${label}のフリーランスの手取りは月いくら？`, a: `1 年を通して稼働し、経費が売上の 10%、青色申告特別控除 65 万円、独身の場合、年間の手取りは 約 ${man(r.takeHome)} 万円、月あたり 約 ${man(r.takeHome / 12)} 万円です。月単価のうち手元に残るのは約 ${rate}% で、残りは経費と所得税・住民税・国民健康保険・国民年金です。` },
    { q: '会社員の月給と比べてどう考えればいい？', a: '月単価は会社員の月給（額面）とは別物です。会社員は健康保険と厚生年金の半分を会社が負担し、賞与・有給休暇・退職金もありますが、フリーランスは保険料を全額自分で払い、案件が途切れた月は収入がありません。同じ金額でも、月単価のほうが手取りや保障は小さくなりやすい点を前提に比べてください。' },
    { q: 'インボイス登録すると手取りはどう変わる？', a: overThreshold
      ? `年商が 1,000 万円を超えると、2 年後からはインボイス登録の有無にかかわらず消費税の課税事業者になり、2 割特例・3 割特例は使えません。サービス業の簡易課税（みなし仕入率 50%）なら納税額は 約 ${man(ct!.consumptionTax)} 万円で、手取りは 約 ${man(ct!.takeHome)} 万円です。月単価を税抜で決め、消費税を上乗せして請求することが前提です。`
      : `月単価を税抜にして消費税を上乗せして請求している場合、2026 年分は 2 割特例で納税額 約 ${man(ct2.consumptionTax)} 万円（手取り 約 ${man(ct2.takeHome)} 万円）、2027・2028 年分は 3 割特例で 約 ${man(ct3.consumptionTax)} 万円（手取り 約 ${man(ct3.takeHome)} 万円）が目安です。税込で据え置かれていると、納税額の分だけ手取りが減ります。` },
  ]
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="text-xs text-muted-foreground"><Link href="/tools" className="hover:underline">無料ツール</Link> › <Link href="/tools/takehome" className="hover:underline">手取り計算</Link> › 月単価{label}</nav>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">月単価{label}のフリーランスの手取りはいくら？【2026年分】</h1>
        <div className="mt-6 rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">月単価 {label} × 12 か月（年商 {man(sales)} 万円）・経費率 10%・青色申告・独身</p>
          <p className="mt-1 text-4xl font-bold">月 約 {man(r.takeHome / 12)} 万円</p>
          <p className="mt-1 text-sm text-muted-foreground">年間の手取り 約 {man(r.takeHome)} 万円・手取り率 {rate}%</p>
        </div>

        <h2 className="mt-10 text-xl font-bold">年間の内訳</h2>
        <table className="mt-3 w-full text-sm">
          <tbody>
            <Row k="年商（月単価 × 12）" v={`${man(sales)} 万円`} />
            <Row k="経費（売上の 10%）" v={`−${man(sales * 0.1)} 万円`} />
            <Row k="事業所得（青色申告特別控除 65 万円の後）" v={`${man(r.income)} 万円`} bold />
            <Row k="所得税（復興特別所得税込み）" v={`−${man(r.incomeTax)} 万円`} />
            <Row k="住民税（翌年 6 月から）" v={`−${man(r.residentTax)} 万円`} />
            <Row k="国民健康保険（概算）" v={`−${man(r.nhi)} 万円`} />
            <Row k="国民年金" v={`−${man(r.pension)} 万円`} />
            <Row k="手取り" v={`${man(r.takeHome)} 万円`} bold />
          </tbody>
        </table>

        <h2 className="mt-10 text-xl font-bold">案件が途切れた場合（稼働月数別）</h2>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">稼働</th><th>年商</th><th>年間の手取り</th><th>12 か月で割った月の手取り</th></tr></thead>
            <tbody>
              {byMonths.map(({ m, r: x }) => (
                <tr key={m} className="border-b border-slate-100">
                  <td className="py-1.5">{m} か月</td>
                  <td className="tabular-nums">{man(a * 10000 * m)} 万円</td>
                  <td className="tabular-nums font-semibold">{man(x.takeHome)} 万円</td>
                  <td className="tabular-nums">{man(x.takeHome / 12)} 万円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl font-bold">経費率別の手取り（12 か月稼働）</h2>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">経費率</th><th>経費</th><th>年間の手取り</th><th>月あたり</th></tr></thead>
            <tbody>
              {byExpense.map(({ e, r: x }) => (
                <tr key={e} className="border-b border-slate-100">
                  <td className="py-1.5">{Math.round(e * 100)}%</td>
                  <td className="tabular-nums">{man(sales * e)} 万円</td>
                  <td className="tabular-nums font-semibold">{man(x.takeHome)} 万円</td>
                  <td className="tabular-nums">{man(x.takeHome / 12)} 万円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl font-bold">条件によって変わるもの</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
          <li>消費税: {overThreshold ? `年商が 1,000 万円を超えるため、2 年後からは課税事業者になり、2 割・3 割特例は使えません。サービス業の簡易課税なら納税額は約 ${man(ct!.consumptionTax)} 万円（手取り 約 ${man(ct!.takeHome)} 万円）が目安です。` : `インボイス登録して消費税を上乗せ請求している場合、2026 年分は 2 割特例で約 ${man(ct2.consumptionTax)} 万円、2027・2028 年分は 3 割特例で約 ${man(ct3.consumptionTax)} 万円の納税が加わります。`}</li>
          <li>個人事業税: システム開発などが法定業種（請負業など）と判断されると、（所得 − 290 万円）× 5% で約 {man(biz.bizTax)} 万円かかります（手取り 約 {man(biz.takeHome)} 万円）。判断は都道府県によって異なります。</li>
          <li>国民健康保険は自治体の料率で、40〜64 歳は介護分が加わります。配偶者・扶養控除、iDeCo、小規模企業共済などは含んでいません。</li>
        </ul>

        <div className="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm">
          <p className="font-semibold">自分の条件で計算する</p>
          <p className="mt-1 text-muted-foreground">手取り計算シミュレーター（無料・登録不要）で、経費・控除・国保の料率・消費税の特例を変えて計算できます。逆に「目標の手取りから必要な単価」を出すなら時間単価計算ツールを使ってください。</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/tools/takehome" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">手取り計算シミュレーター</Link>
            <Link href="/tools/rate" className="inline-flex h-9 items-center rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary hover:bg-primary hover:text-white">必要な単価を逆算する</Link>
          </div>
        </div>

        <ToolFaq items={faqs} />

        <section className="mt-10 text-sm">
          <h2 className="text-base font-semibold">ほかの月単価の手取り</h2>
          <div className="mt-2 flex justify-between">
            {prev ? <Link href={`/tools/takehome/monthly/${prev}`} className="text-primary hover:underline">← 月単価 {prev} 万円</Link> : <span />}
            {next ? <Link href={`/tools/takehome/monthly/${next}`} className="text-primary hover:underline">月単価 {next} 万円 →</Link> : <span />}
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {AMOUNTS.map((x) => (
              <li key={x}><Link href={`/tools/takehome/monthly/${x}`} className={`inline-block rounded border px-2 py-1 text-xs ${x === a ? 'border-primary bg-primary/10 font-semibold' : 'hover:bg-slate-50'}`}>月単価 {x}万円</Link></li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">前提: 2026 年分、月単価は税抜、独身。所得税の基礎控除は 2026 年分の所得区分別の額、住民税 10%＋均等割、国保は（所得 − 43 万円）× 10% ＋ 均等割 6 万円（上限 109 万円）、国民年金 月 17,920 円。概算です。<Link href="/tools/takehome" className="text-primary hover:underline">売上別の手取り一覧はこちら</Link>。</p>
        </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '無料ツール', item: `${SITE_URL}/tools` }, { '@type': 'ListItem', position: 2, name: '手取り計算', item: `${SITE_URL}/tools/takehome` }, { '@type': 'ListItem', position: 3, name: `月単価${label}`, item: `${SITE_URL}/tools/takehome/monthly/${a}` }] }) }} />
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
