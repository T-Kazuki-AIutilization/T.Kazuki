import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { SITE_URL } from '@/lib/site'
import { calcNhi, NHI_AMOUNTS as AMOUNTS, NHI_DEFAULTS } from '@/lib/nhi'

// 所得別の国民健康保険料ページ。国保料ツールと同じ例示の料率でビルド時に算出する。
export const dynamicParams = false

const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })
const yen = (n: number) => Math.round(n).toLocaleString('ja-JP')

function nhi(incomes: number[], m40: number) {
  return calcNhi({ ...NHI_DEFAULTS, incomes, members40to64: m40 })
}

function figures(amount: number) {
  const x = amount * 10000
  const single = nhi([x], 0)
  const households = [
    { k: '単身・39 歳以下', r: single },
    { k: '単身・40〜64 歳（介護分あり）', r: nhi([x], 1) },
    { k: '夫婦（配偶者の所得 0）・39 歳以下', r: nhi([x, 0], 0) },
    { k: '夫婦＋子 1 人・39 歳以下', r: nhi([x, 0, 0], 0) },
    { k: '夫婦とも 40〜64 歳', r: nhi([x, 0], 2) },
  ]
  const sales = Math.round(((x + 650000) / 0.8) / 10000) * 10000
  return { x, single, households, sales }
}

export function generateStaticParams() {
  return AMOUNTS.map((a) => ({ amount: String(a) }))
}

export function generateMetadata({ params }: { params: { amount: string } }): Metadata {
  const a = Number(params.amount)
  if (!AMOUNTS.includes(a)) return {}
  const { single } = figures(a)
  const title = `所得${a.toLocaleString('ja-JP')}万円の国民健康保険料は年約${man(single.total)}万円（自営業・フリーランス）【世帯別の目安】| FreelanceOS`
  const description = `所得 ${a.toLocaleString('ja-JP')} 万円の自営業・フリーランスの国民健康保険料は、単身・39 歳以下で年 約 ${man(single.total)} 万円（月 約 ${man(single.total / 12)} 万円）が目安。40〜64 歳（介護分）や夫婦・子どもがいる世帯の保険料、医療分・支援金分の内訳、保険料を下げる方法。`
  return {
    title,
    description,
    alternates: { canonical: `/tools/nhi/${a}` },
    openGraph: { title, description, type: 'article', locale: 'ja_JP', images: [{ url: '/blog/og/tools-nhi.png', width: 1200, height: 630 }] },
  }
}

export default function NhiAmountPage({ params }: { params: { amount: string } }) {
  const a = Number(params.amount)
  if (!AMOUNTS.includes(a)) notFound()
  const { x, single, households, sales } = figures(a)
  const label = `${a.toLocaleString('ja-JP')}万円`
  const idx = AMOUNTS.indexOf(a)
  const prev = AMOUNTS[idx - 1]
  const next = AMOUNTS[idx + 1]
  const d = NHI_DEFAULTS
  const faqs = [
    { q: `所得${label}の国民健康保険料は月いくら？`, a: `例示の料率（医療分 7.7%＋均等割 4.7 万円、支援金分 2.7%＋均等割 1.6 万円）で計算すると、単身・39 歳以下で年 約 ${yen(single.total)} 円、月あたり 約 ${yen(single.total / 12)} 円です。多くの自治体は 6 月〜翌 3 月の 10 回払いなので、1 回あたりは 約 ${yen(single.total / 10)} 円です。料率は自治体で大きく違うため、お住まいの市区町村の料率で計算し直してください。` },
    { q: '「所得」は年収や売上のこと？', a: `いいえ。自営業・フリーランスの所得は「売上 − 経費 − 青色申告特別控除」です。たとえば経費が売上の 20%、青色申告特別控除 65 万円なら、所得 ${label}は売上 約 ${man(sales)} 万円に当たります。会社員の給与なら「年収 − 給与所得控除」が所得です。国保料はこの所得から 43 万円を引いた「基準所得」に料率をかけて計算します。` },
    { q: '国民健康保険料を下げる方法は？', a: '青色申告特別控除 65 万円（e-Tax と複式簿記）を受ける、経費を漏れなく計上する、といった方法で所得を下げると保険料も下がります。退職直後なら会社の健康保険の任意継続（最長 2 年）や家族の扶養と比べる、倒産・解雇など会社都合で離職した場合は給与所得を 30% として計算する軽減を申請する、所得が低い年は確定申告をして均等割の軽減を受ける、という方法もあります。iDeCo や小規模企業共済は所得税・住民税は下がりますが、国保の基準所得は下がりません。' },
  ]
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="text-xs text-muted-foreground"><Link href="/tools" className="hover:underline">無料ツール</Link> › <Link href="/tools/nhi" className="hover:underline">国民健康保険料の計算</Link> › 所得{label}</nav>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">所得{label}の国民健康保険料はいくら？自営業・フリーランスの世帯別の目安</h1>
        <div className="mt-6 rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">所得 {label}・単身・39 歳以下（例示の料率）</p>
          <p className="mt-1 text-4xl font-bold">年 約 {man(single.total)} 万円</p>
          <p className="mt-1 text-sm text-muted-foreground">月あたり 約 {yen(single.total / 12)} 円・10 回払いなら 1 回 約 {yen(single.total / 10)} 円</p>
        </div>

        <h2 className="mt-10 text-xl font-bold">世帯別の国民健康保険料（所得 {label}）</h2>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">世帯</th><th>医療分</th><th>支援金分</th><th>介護分</th><th>年額</th></tr></thead>
            <tbody>
              {households.map(({ k, r }) => (
                <tr key={k} className="border-b border-slate-100">
                  <td className="py-1.5 pr-2">{k}</td>
                  <td className="tabular-nums">{man(r.medical)} 万円</td>
                  <td className="tabular-nums">{man(r.support)} 万円</td>
                  <td className="tabular-nums">{r.care ? `${man(r.care)} 万円` : '−'}</td>
                  <td className="tabular-nums font-semibold">{man(r.total)} 万円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">所得があるのは本人だけ（家族の所得 0）として計算。家族にも所得があれば、その分の所得割が加わります。</p>

        <h2 className="mt-10 text-xl font-bold">計算方法</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          <li>基準所得 ＝ 所得 {label} − 43 万円 ＝ {man(single.base)} 万円</li>
          <li>医療分 ＝ 基準所得 × {(d.medical.rate * 100).toFixed(1)}% ＋ 均等割 {man(d.medical.perCapita)} 万円 × 人数（上限 {man(d.medical.cap)} 万円）</li>
          <li>後期高齢者支援金分 ＝ 基準所得 × {(d.support.rate * 100).toFixed(1)}% ＋ 均等割 {man(d.support.perCapita)} 万円 × 人数（上限 {man(d.support.cap)} 万円）</li>
          <li>介護分（40〜64 歳のみ）＝ 基準所得 × {(d.care.rate * 100).toFixed(1)}% ＋ 均等割 {man(d.care.perCapita)} 万円 × 人数（上限 {man(d.care.cap)} 万円）</li>
        </ol>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">料率・均等割・平等割（世帯ごとの定額）は市区町村ごとに違い、同じ所得でも年 10 万円以上差が出ることがあります。上の料率は計算の例です。2026 年度からは子ども・子育て支援金分も加わります。所得の低い世帯は均等割・平等割が 7・5・2 割軽減されることがあります。</p>

        <div className="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm">
          <p className="font-semibold">お住まいの自治体の料率で計算する</p>
          <p className="mt-1 text-muted-foreground">国民健康保険料の計算ツール（無料・登録不要）で、料率・均等割・平等割を市区町村の値に変えて計算できます。家族の所得や 40〜64 歳の人数も入力できます。</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/tools/nhi" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">国保料の計算ツールを開く</Link>
            <Link href="/tools/takehome" className="inline-flex h-9 items-center rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary hover:bg-primary hover:text-white">税金・年金も含めた手取りを計算する</Link>
          </div>
        </div>

        <ToolFaq items={faqs} />

        <section className="mt-10 text-sm">
          <h2 className="text-base font-semibold">ほかの所得の国民健康保険料</h2>
          <div className="mt-2 flex justify-between">
            {prev ? <Link href={`/tools/nhi/${prev}`} className="text-primary hover:underline">← 所得 {prev.toLocaleString('ja-JP')} 万円</Link> : <span />}
            {next ? <Link href={`/tools/nhi/${next}`} className="text-primary hover:underline">所得 {next.toLocaleString('ja-JP')} 万円 →</Link> : <span />}
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {AMOUNTS.map((v) => (
              <li key={v}><Link href={`/tools/nhi/${v}`} className={`inline-block rounded border px-2 py-1 text-xs ${v === a ? 'border-primary bg-primary/10 font-semibold' : 'hover:bg-slate-50'}`}>所得 {v.toLocaleString('ja-JP')}万円</Link></li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">前提: 所得 {yen(x)} 円（売上 − 経費 − 青色申告特別控除）、例示の料率、上限は 2025 年度の法定上限。低所得世帯の軽減、子ども・子育て支援金分、減免は含みません。正確な保険料はお住まいの市区町村の通知・試算でご確認ください。<Link href="/blog/freelance-health-insurance-pension" className="text-primary hover:underline">国保と国民年金の解説はこちら</Link>。</p>
        </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '無料ツール', item: `${SITE_URL}/tools` }, { '@type': 'ListItem', position: 2, name: '国民健康保険料の計算', item: `${SITE_URL}/tools/nhi` }, { '@type': 'ListItem', position: 3, name: `所得${label}`, item: `${SITE_URL}/tools/nhi/${a}` }] }) }} />
    </SiteShell>
  )
}
