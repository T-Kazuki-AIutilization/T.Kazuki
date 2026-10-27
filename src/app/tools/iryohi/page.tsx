import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { ExcelUpsell } from '@/components/marketing/excel-upsell'
import { SITE_URL } from '@/lib/site'
import { IRYOHI_COSTS, IRYOHI_SALARIES, medicalDeduction, savingFor } from '@/lib/iryohi'
import { IryohiCalculator } from './calculator'

export const metadata: Metadata = {
  title: '医療費控除でいくら戻る？還付額シミュレーター（フリーランス・会社員・無料）【2026年分】| FreelanceOS',
  description:
    '1 年間の医療費と年収（フリーランスは売上・経費）から、医療費控除とセルフメディケーション税制で下がる所得税・住民税を計算。年収×医療費の早見表、対象になる医療費・ならないもの、家族分の合算の注意点つき。登録不要。',
  alternates: { canonical: '/tools/iryohi' },
  openGraph: { title: '医療費控除の還付額シミュレーター（無料）| FreelanceOS', description: '医療費控除とセルフメディケーション税制で戻る税金を計算。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-iryohi.png', width: 1200, height: 630 }] },
}

const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })
const yen = (n: number) => Math.round(n).toLocaleString('ja-JP')

const FAQS = [
  { q: '医療費控除の対象になるものは？', a: '病院・歯科の診療費や治療費、処方された薬、治療のために買った市販薬、通院のための電車・バス代、出産費用、治療目的の歯列矯正やマッサージ（あん摩マッサージ指圧師などによる施術）などです。健康診断（異常がなかった場合）、予防接種、美容目的の施術、ビタミン剤などの健康増進のための購入、自家用車のガソリン代や駐車場代は対象外です。' },
  { q: '家族の医療費もまとめられる？', a: '生計を一にする配偶者や親族の分は合算できます。所得税の税率が高い人がまとめて申告すると戻る額が大きくなりやすい一方、総所得金額等が 200 万円未満の人は「10 万円」ではなく「所得の 5%」を超えた分から控除できるため、所得の低い人がまとめたほうが有利な場合もあります。このツールでそれぞれの条件を入れて比べてください。' },
  { q: '会社員はいつまでに申告すればいい？', a: '年末調整を受けている会社員が医療費控除だけを受ける場合は「還付申告」になり、翌年 1 月 1 日から 5 年以内なら提出できます。フリーランス・個人事業主は、毎年の確定申告（翌年 2 月 16 日〜3 月 15 日）に含めます。' },
  { q: '領収書は提出する？', a: '提出は不要で、「医療費控除の明細書」を確定申告書に添付します。健康保険組合などから届く「医療費のお知らせ（医療費通知）」を添付すれば、その分の明細の記入を省略できます。領収書は自宅で 5 年間保存します。' },
  { q: 'セルフメディケーション税制とどちらを選ぶ？', a: '医療費が 10 万円（所得 200 万円未満なら所得の 5%）を超えない年は、対象の市販薬（パッケージに識別マークがあるもの）を 1.2 万円を超えて買っていればセルフメディケーション税制のほうが有利です。健康診断や予防接種などを受けていることが要件です。どちらか一方しか選べないので、このツールで両方を比べられます。2027 年分以降の扱いは最新の税制改正を確認してください。' },
  { q: '国民健康保険料も下がる？', a: '下がりません。国保料は「所得 − 43 万円」をもとに計算され、医療費控除などの所得控除は差し引かれないためです。下がるのは所得税と住民税です。' },
]

function table() {
  return IRYOHI_SALARIES.map((s) => {
    const income = savingFor({ kind: 'employee', salary: s * 10000 }, 0).income
    return { s, cells: IRYOHI_COSTS.map((c) => savingFor({ kind: 'employee', salary: s * 10000 }, medicalDeduction(income, c * 10000, 0).deduction).total) }
  })
}

export default function IryohiToolPage() {
  const rows = table()
  const fl = savingFor({ kind: 'freelance', sales: 5000000, expenses: 1000000, aoiro: 650000 }, 100000)
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FreelanceOS 医療費控除の還付額シミュレーター', url: `${SITE_URL}/tools/iryohi`, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' }, inLanguage: 'ja' }
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">医療費控除でいくら戻る？還付額シミュレーター <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">1 年間に払った医療費と、年収（フリーランスは売上・経費）を入れると、医療費控除とセルフメディケーション税制で下がる所得税・住民税を計算します（2026 年分）。</p>
        </div>
        <IryohiCalculator />

        <section className="mt-12 text-sm leading-relaxed">
          <h2 className="text-base font-semibold">年収 × 医療費の早見表（会社員・独身、所得税＋住民税の減少額）</h2>
          <div className="overflow-x-auto">
            <table className="mt-3 w-full">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">年収</th>{IRYOHI_COSTS.map((c) => <th key={c} className="text-right">医療費 {c} 万円</th>)}</tr></thead>
              <tbody>
                {rows.map(({ s, cells }) => (
                  <tr key={s} className="border-b border-slate-100"><td className="py-1.5">{s} 万円</td>{cells.map((x, i) => <td key={i} className="text-right tabular-nums">{yen(x)} 円</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-muted-foreground">医療費から 10 万円を引いた額が控除額になり、戻る額は「控除額 ×（所得税の税率 × 1.021 ＋ 住民税 10%）」がおおよその目安です。年収 500 万円の会社員なら税率 10% なので、医療費 20 万円で控除額 10 万円、戻る額は約 2 万円です。フリーランスで売上 500 万円・経費 100 万円・青色 65 万円の場合も、控除額 10 万円で約 {man(fl.total)} 万円（所得税 {yen(fl.it)} 円・住民税 {yen(fl.res)} 円）下がります。</p>
        </section>

        <section className="mt-10 text-sm leading-relaxed">
          <h2 className="text-base font-semibold">医療費控除の計算方法</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>1 年間（1 月〜12 月）に自分と生計を一にする家族のために払った医療費を合計する</li>
            <li>生命保険の入院給付金・高額療養費・出産育児一時金など、補填された額を引く</li>
            <li>さらに 10 万円（総所得金額等が 200 万円未満なら、その 5%）を引いた額が医療費控除額（上限 200 万円）</li>
            <li>控除額に所得税の税率（復興特別所得税込み）と住民税 10% をかけた分だけ税金が下がる</li>
          </ol>
          <p className="mt-3 text-muted-foreground">フリーランス・個人事業主は、確定申告で納める所得税が減り、翌年度の住民税も下がります。源泉徴収された所得税が多い人は、その分が還付されます。</p>
        </section>

        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/tools/kakutei-checklist" className="text-primary hover:underline">確定申告の準備チェックリスト（医療費の明細も）</Link></li>
            <li><Link href="/blog/freelance-tax-prep" className="text-primary hover:underline">フリーランスの確定申告の準備</Link></li>
            <li><Link href="/blog/freelance-shotoku-koujo-ichiran" className="text-primary hover:underline">フリーランスが使える所得控除一覧（節税額の目安と証明書）</Link></li>
            <li><Link href="/tools/kyosai" className="text-primary hover:underline">iDeCo・小規模企業共済の節税額シミュレーター</Link></li>
            <li><Link href="/tools/furusato" className="text-primary hover:underline">ふるさと納税の上限額シミュレーター</Link></li>
          </ul>
          <ExcelUpsell item="tax" />
          <ToolFaq items={FAQS} />
          <p className="mt-6 text-xs">前提: 2026 年分。所得税は速算表と復興特別所得税 2.1%、基礎控除は合計所得に応じて 104 万〜62 万円（2026 年度改正後）、住民税は所得割 10%（調整控除 2,500 円）＋均等割 5,000 円。会社員は給与所得控除（2026 年分）と社会保険料（年収の 15%）、フリーランスは国保（所得割 10%＋均等割 6 万円）と国民年金で概算。扶養控除・生命保険料控除などは含みません。最終確認は確定申告書等作成コーナーや税務署でお願いします。</p>
          <MoreTools current="/tools/iryohi" />
        </section>
      </main>
    </SiteShell>
  )
}
