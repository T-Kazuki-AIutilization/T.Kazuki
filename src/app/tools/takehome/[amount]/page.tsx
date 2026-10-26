import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { ExcelUpsell } from '@/components/marketing/excel-upsell'
import { SITE_URL } from '@/lib/site'
import { calc, furusatoLimit, TAKEHOME_AMOUNTS as AMOUNTS, type Inputs } from '@/lib/takehome'
import { employeeTakeHome, KANSAN_SALARIES } from '@/lib/fukugyo'

// 売上別の手取りページ。数値はツールと同じ計算式でビルド時に算出する。
export const dynamicParams = false

const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })
const base = (sales: number, expenseRate = 0.2): Inputs => ({ sales, expenses: Math.round(sales * expenseRate), aoiro: 650000, other: 0, withheld: 0, taxable: false, bizRate: 0, nhiRate: 0.1 })

function figures(amount: number) {
  const sales = amount * 10000
  const r = calc(base(sales))
  const rate = Math.round((r.takeHome / sales) * 1000) / 10
  const byExpense = [0.1, 0.2, 0.3, 0.4].map((e) => ({ e, r: calc(base(sales, e)) }))
  const biz = calc({ ...base(sales), bizRate: 0.05 })
  const ct2 = calc({ ...base(sales), taxable: true, ctRate: 0.2 })
  const ct3 = calc({ ...base(sales), taxable: true, ctRate: 0.3 })
  const ideco = calc({ ...base(sales), other: 816000 })
  const idecoSaving = r.taxes + r.social - (ideco.taxes + ideco.social)
  const furusato = furusatoLimit({ sales, expenses: Math.round(sales * 0.2), aoiro: 650000, other: 0, nhiRate: 0.1 }).limit
  const emp = employeeTakeHome(sales)
  return { sales, r, rate, byExpense, biz, ct2, ct3, idecoSaving, furusato, emp }
}

export function generateStaticParams() {
  return AMOUNTS.map((a) => ({ amount: String(a) }))
}

export function generateMetadata({ params }: { params: { amount: string } }): Metadata {
  const a = Number(params.amount)
  if (!AMOUNTS.includes(a)) return {}
  const { r, rate } = figures(a)
  const title = `個人事業主・フリーランスの年収（売上）${a.toLocaleString('ja-JP')}万円の手取りは約${man(r.takeHome)}万円【2026年分・内訳つき】| FreelanceOS`
  const description = `売上 ${a.toLocaleString('ja-JP')} 万円のフリーランス・個人事業主の手取りは約 ${man(r.takeHome)} 万円（月 約 ${man(r.takeHome / 12)} 万円、手取り率 ${rate}%）。所得税・住民税・国民健康保険・国民年金の内訳、経費率別の手取り、インボイス登録した場合の消費税まで 2026 年分の制度で試算。`
  return {
    title,
    description,
    alternates: { canonical: `/tools/takehome/${a}` },
    openGraph: { title, description, type: 'article', locale: 'ja_JP', images: [{ url: '/blog/og/tools-takehome.png', width: 1200, height: 630 }] },
  }
}

export default function TakeHomeAmountPage({ params }: { params: { amount: string } }) {
  const a = Number(params.amount)
  if (!AMOUNTS.includes(a)) notFound()
  const { sales, r, rate, byExpense, biz, ct2, ct3, idecoSaving, furusato, emp } = figures(a)
  const gap = emp.takeHome - r.takeHome
  const label = `${a.toLocaleString('ja-JP')}万円`
  const idx = AMOUNTS.indexOf(a)
  const prev = AMOUNTS[idx - 1]
  const next = AMOUNTS[idx + 1]
  const faqs = [
    { q: `売上${label}のフリーランスの手取りは月いくら？`, a: `経費が売上の 20%、青色申告特別控除 65 万円、独身の場合、年間の手取りは約 ${man(r.takeHome)} 万円で、月あたり約 ${man(r.takeHome / 12)} 万円です。住民税と国民健康保険は前年の所得で決まるため、独立 1 年目は会社員時代の所得で計算され、この目安と異なります。` },
    { q: `売上${label}だと税金と保険料はいくら？`, a: `所得税（復興特別所得税込み）約 ${man(r.incomeTax)} 万円、住民税 約 ${man(r.residentTax)} 万円、国民健康保険 約 ${man(r.nhi)} 万円、国民年金 約 ${man(r.pension)} 万円で、合計 約 ${man(r.taxes + r.social)} 万円です（経費率 20%、国保は所得割 10%＋均等割 6 万円で概算）。` },
    { q: `会社員の年収${label}と比べて手取りは多い？少ない？`, a: `会社員の年収（額面）${label}の手取りは約 ${man(emp.takeHome)} 万円（社会保険料を年収の 15% で概算、独身）です。売上${label}のフリーランス（経費率 20%）の約 ${man(r.takeHome)} 万円と比べると、${gap >= 0 ? `会社員のほうが約 ${man(gap)} 万円多く` : `フリーランスのほうが約 ${man(-gap)} 万円多く`}なります。フリーランスは経費を自分で払い、国保・国民年金を全額負担する一方、青色申告特別控除などで税金を抑えられます。将来の厚生年金・退職金・有給がない点も考えると、同じ金額なら会社員のほうが有利なことが多いです。` },
    { q: '手取りを増やすには？', a: `iDeCo の掛金を自営業の上限（年 81.6 万円）まで払うと、所得税と住民税が合わせて約 ${man(idecoSaving)} 万円下がります（国保の保険料は変わりません。掛金は老後資金として積み立てられます）。ほかに、青色申告特別控除 65 万円を受ける（e-Tax と複式簿記）、経費の計上漏れをなくす、小規模企業共済に入る、といった方法があります。` },
  ]
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="text-xs text-muted-foreground"><Link href="/tools" className="hover:underline">無料ツール</Link> › <Link href="/tools/takehome" className="hover:underline">手取り計算</Link> › 売上{label}</nav>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">年収（売上）{label}のフリーランス・個人事業主の手取りはいくら？【2026年分】</h1>
        <p className="mt-2 text-xs text-muted-foreground">個人事業主の「年収」は、一般に 1 年間の売上（税抜）を指すことが多いため、ここでは売上 {label}として計算しています。経費を引いた後の所得が {label}の場合は、売上がもっと大きくなります。</p>
        <div className="mt-6 rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">売上 {label}・経費率 20%・青色申告・独身の場合の手取り（年間）</p>
          <p className="mt-1 text-4xl font-bold">約 {man(r.takeHome)} 万円</p>
          <p className="mt-1 text-sm text-muted-foreground">月あたり 約 {man(r.takeHome / 12)} 万円・手取り率 {rate}%</p>
        </div>

        <h2 className="mt-10 text-xl font-bold">内訳</h2>
        <table className="mt-3 w-full text-sm">
          <tbody>
            <Row k="売上" v={`${man(sales)} 万円`} />
            <Row k="経費（売上の 20%）" v={`−${man(sales * 0.2)} 万円`} />
            <Row k="青色申告特別控除" v={`−${man(r.aoiroApplied)} 万円`} muted />
            <Row k="事業所得（控除後）" v={`${man(r.income)} 万円`} bold />
            <Row k="所得税（復興特別所得税込み）" v={`−${man(r.incomeTax)} 万円`} />
            <Row k="住民税（翌年 6 月から）" v={`−${man(r.residentTax)} 万円`} />
            <Row k="国民健康保険（概算）" v={`−${man(r.nhi)} 万円`} />
            <Row k="国民年金" v={`−${man(r.pension)} 万円`} />
            <Row k="手取り" v={`${man(r.takeHome)} 万円`} bold />
          </tbody>
        </table>
        <p className="mt-2 text-xs text-muted-foreground">手取り ＝ 売上 − 経費 − 税金 − 社会保険料。青色申告特別控除は経費ではないため手取りからは引きません（税金を減らす効果だけがあります）。</p>

        <h2 className="mt-10 text-xl font-bold">経費率別の手取り（売上 {label}）</h2>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">経費率</th><th>経費</th><th>税金・保険料</th><th>手取り</th><th>手取り率</th></tr></thead>
            <tbody>
              {byExpense.map(({ e, r: x }) => (
                <tr key={e} className="border-b border-slate-100">
                  <td className="py-1.5">{Math.round(e * 100)}%</td>
                  <td className="tabular-nums">{man(sales * e)} 万円</td>
                  <td className="tabular-nums">{man(x.taxes + x.social)} 万円</td>
                  <td className="tabular-nums font-semibold">{man(x.takeHome)} 万円</td>
                  <td className="tabular-nums">{Math.round((x.takeHome / sales) * 1000) / 10}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl font-bold">会社員の年収{label}と比べると</h2>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2"></th><th className="text-right">フリーランス（売上{label}）</th><th className="text-right">会社員（年収{label}）</th></tr></thead>
            <tbody>
              <tr className="border-b border-slate-100"><td className="py-1.5">経費</td><td className="text-right tabular-nums">{man(sales * 0.2)} 万円</td><td className="text-right tabular-nums">―</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5">社会保険料</td><td className="text-right tabular-nums">{man(r.social)} 万円</td><td className="text-right tabular-nums">{man(emp.social)} 万円</td></tr>
              <tr className="border-b border-slate-100"><td className="py-1.5">所得税＋住民税</td><td className="text-right tabular-nums">{man(r.incomeTax + r.residentTax)} 万円</td><td className="text-right tabular-nums">{man(emp.incomeTax + emp.residentTax)} 万円</td></tr>
              <tr className="border-b border-slate-100 font-semibold"><td className="py-1.5">手取り</td><td className="text-right tabular-nums">{man(r.takeHome)} 万円</td><td className="text-right tabular-nums">{man(emp.takeHome)} 万円</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm leading-relaxed">同じ「年収{label}」でも、{gap >= 0 ? <>会社員のほうが手取りが約 {man(gap)} 万円多くなります。</> : <>この条件ではフリーランスのほうが手取りが約 {man(-gap)} 万円多くなります。</>}フリーランスは仕事の経費を自分で払い、国民健康保険と国民年金を全額負担します。一方、会社員の厚生年金・健康保険は会社も同額を負担しており、将来の年金は会社員のほうが厚くなります。</p>
        {KANSAN_SALARIES.includes(a) && (
          <p className="mt-2 text-sm"><Link href={`/tools/kansan/${a}`} className="text-primary hover:underline">会社員の年収{label}と同じ手取りを得るのに必要な売上はいくら？ →</Link></p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">会社員は独身・扶養なし、社会保険料を年収の 15% で概算（給与所得控除は 2026 年分）。退職金・賞与の扱いや会社の福利厚生は含みません。</p>

        <h2 className="mt-10 text-xl font-bold">条件によって変わるもの</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
          <li>個人事業税: デザイン業・コンサルタント業など法定業種なら、（所得 − 事業主控除 290 万円）× 5% で約 {man(biz.bizTax)} 万円かかり、手取りは約 {man(biz.takeHome)} 万円になります。ライター・プログラマーなど非該当の業種はかかりません。</li>
          <li>インボイス登録した課税事業者: 消費税の納税が加わります。2026 年分は 2 割特例で約 {man(ct2.consumptionTax)} 万円（手取り 約 {man(ct2.takeHome)} 万円）、2027・2028 年分は 3 割特例で約 {man(ct3.consumptionTax)} 万円（手取り 約 {man(ct3.takeHome)} 万円）が目安です（売上を税抜で計算）。</li>
          <li>国民健康保険: 料率と均等割は自治体ごとに違い、40〜64 歳は介護分が加わります。扶養家族がいれば人数分の均等割がかかります。</li>
          <li>ふるさと納税: この条件での上限の目安は約 {furusato.toLocaleString('ja-JP')} 円です（<Link href={`/tools/furusato/${a}`} className="text-primary hover:underline">売上{label}のふるさと納税の上限</Link>）。</li>
          <li>配偶者控除・扶養控除・医療費控除などは含んでいません。</li>
        </ul>

        <div className="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm">
          <p className="font-semibold">自分の売上・経費で計算する</p>
          <p className="mt-1 text-muted-foreground">手取り計算シミュレーター（無料・登録不要）なら、経費・青色申告・iDeCo などの控除・国保の料率・消費税の特例を自由に変えて計算できます。</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/tools/takehome" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">手取り計算シミュレーターを開く</Link>
            <Link href={`/tools/furusato/${a}`} className="inline-flex h-9 items-center rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary hover:bg-primary hover:text-white">ふるさと納税の上限を見る</Link>
          </div>
        </div>

        <ExcelUpsell item="takehome" />

        <ToolFaq items={faqs} />

        <MoreTools current="/tools/takehome" />

        <section className="mt-10 text-sm">
          <h2 className="text-base font-semibold">ほかの売上の手取り</h2>
          <div className="mt-2 flex justify-between">
            {prev ? <Link href={`/tools/takehome/${prev}`} className="text-primary hover:underline">← 売上 {prev.toLocaleString('ja-JP')} 万円</Link> : <span />}
            {next ? <Link href={`/tools/takehome/${next}`} className="text-primary hover:underline">売上 {next.toLocaleString('ja-JP')} 万円 →</Link> : <span />}
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {AMOUNTS.map((x) => (
              <li key={x}><Link href={`/tools/takehome/${x}`} className={`inline-block rounded border px-2 py-1 text-xs ${x === a ? 'border-primary bg-primary/10 font-semibold' : 'hover:bg-slate-50'}`}>{x.toLocaleString('ja-JP')}万円</Link></li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">前提: 2026 年分。所得税の基礎控除は合計所得に応じて 95 万〜58 万円（2025 年改正の上乗せ特例）、住民税は所得割 10%＋均等割 5,000 円、国保は（所得 − 43 万円）× 10% ＋ 均等割 6 万円（上限 109 万円）、国民年金 月 17,920 円。概算のため、実際の税額は確定申告書等作成コーナーや自治体の試算でご確認ください。<Link href="/blog/freelance-take-home-pay" className="text-primary hover:underline">手取りの計算方法の解説はこちら</Link>。</p>
        </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '無料ツール', item: `${SITE_URL}/tools` }, { '@type': 'ListItem', position: 2, name: '手取り計算', item: `${SITE_URL}/tools/takehome` }, { '@type': 'ListItem', position: 3, name: `売上${label}`, item: `${SITE_URL}/tools/takehome/${a}` }] }) }} />
    </SiteShell>
  )
}

function Row({ k, v, bold, muted }: { k: string; v: string; bold?: boolean; muted?: boolean }) {
  return (
    <tr className={`border-b border-slate-100 ${bold ? 'font-semibold' : ''} ${muted ? 'text-muted-foreground' : ''}`}>
      <td className="py-1.5">{k}</td>
      <td className="py-1.5 text-right tabular-nums">{v}</td>
    </tr>
  )
}
