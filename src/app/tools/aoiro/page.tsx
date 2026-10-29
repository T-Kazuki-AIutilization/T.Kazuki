import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { ExcelUpsell } from '@/components/marketing/excel-upsell'
import { AffiliateBox, AdNotice } from '@/components/marketing/affiliate-box'
import { SITE_URL } from '@/lib/site'
import { AoiroCalculator } from './calculator'
import { calc } from '@/lib/takehome'

export const metadata: Metadata = {
  title: '青色申告の節税額シミュレーター｜白色と比べていくら得？65万円控除の効果（無料・2026年分）| FreelanceOS',
  description:
    'フリーランス・個人事業主が青色申告（65 万・55 万・10 万円控除）にすると、白色申告より所得税・住民税・国民健康保険がいくら下がるかを計算。所得別の早見表、65 万円控除の条件、承認申請の期限つき。登録不要。',
  alternates: { canonical: '/tools/aoiro' },
  openGraph: { title: '青色申告の節税額シミュレーター（無料）| FreelanceOS', description: '白色申告と比べた青色申告の節税額を計算。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-aoiro.png', width: 1200, height: 630 }] },
}

const FAQS = [
  { q: '青色申告 65 万円控除の条件は？', a: '青色申告の承認を受けたうえで、①複式簿記（正規の簿記）で記帳し、②貸借対照表と損益計算書を確定申告書に添付して、③期限内に申告することに加え、④e-Tax で申告するか、帳簿を優良な電子帳簿として保存することが条件です。④を満たさず書面で提出すると 55 万円、簡易簿記なら 10 万円の控除になります。' },
  { q: '2027 年分から青色申告特別控除はどう変わる？', a: '令和 8 年度税制改正で、2027 年分からは「複式簿記＋e-Tax＋優良な電子帳簿（またはデジタルシームレス保存）＋届出書」で 75 万円、「複式簿記＋e-Tax」で 65 万円、「複式簿記＋書面」で 10 万円になり、55 万円の区分はなくなります。簡易簿記の 10 万円は、前々年の収入が 1,000 万円を超えると 0 円です。このツールは 2026 年分の区分で計算しています。' },
  { q: '青色申告の承認申請はいつまで？', a: '青色申告をしたい年の 3 月 15 日までに「所得税の青色申告承認申請書」を税務署に出します。その年の 1 月 16 日以後に開業した場合は、開業日から 2 か月以内です。2027 年分から青色にしたいなら、2027 年 3 月 15 日が期限です。開業届と同時に出すのが一般的です。' },
  { q: '控除以外のメリットは？', a: '赤字（純損失）を翌年以降 3 年間繰り越せる、家族に払う給与を届け出たうえで経費にできる（青色事業専従者給与）、といった特典があります。このツールの節税額には、控除による効果だけを含めています。' },
  { q: '国民健康保険も安くなるの？', a: 'はい。国民健康保険料は、青色申告特別控除を引いた後の所得をもとに計算されるため、控除額 × 国保の所得割率（10% 前後）の分だけ保険料も下がります。所得税・住民税と合わせると、65 万円控除の効果は所得によって年 10 万〜30 万円程度になります。' },
  { q: '帳簿づけが不安です', a: '会計ソフトを使えば、銀行口座やカードの明細を取り込むだけで複式簿記の帳簿ができ、e-Tax での提出までまとめて行えます。Excel や手書きでも複式簿記はできますが、取引が多い人は会計ソフトのほうが楽です。' },
]

const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })
const INCOMES = [200, 300, 400, 500, 600, 800, 1000]

export default function AoiroToolPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FreelanceOS 青色申告の節税額シミュレーター', url: `${SITE_URL}/tools/aoiro`, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' }, inLanguage: 'ja' }
  const table = INCOMES.map((inc) => {
    const sales = inc * 10000
    const b = (aoiro: number) => { const r = calc({ sales, expenses: 0, aoiro, other: 0, withheld: 0, taxable: false, bizRate: 0, nhiRate: 0.1 }); return r.taxes + r.social - r.pension }
    const w = b(0)
    return { inc, d10: w - b(100000), d55: w - b(550000), d65: w - b(650000) }
  })
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">青色申告の節税額シミュレーター <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
          <AdNotice ids={['mf-kakutei', 'yayoi-aoiro', 'freee-kaikei']} />
          <p className="mt-2 text-sm text-muted-foreground">白色申告と比べて、青色申告（65 万・55 万・10 万円控除）にすると所得税・住民税・国民健康保険がいくら下がるかを計算します（2026 年分）。</p>
        </div>
        <AoiroCalculator />

        <section className="mt-12">
          <h2 className="text-lg font-bold">所得別: 白色申告と比べて下がる税金・保険料（年間）</h2>
          <p className="mt-1 text-xs text-muted-foreground">所得 ＝ 売上 − 経費（青色申告特別控除の前）。独身、国保は所得割 10%＋均等割 6 万円で概算。</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">所得</th><th className="pr-3">青色 10 万円</th><th className="pr-3">青色 55 万円</th><th>青色 65 万円</th></tr></thead>
              <tbody>
                {table.map((t) => (
                  <tr key={t.inc} className="border-b border-slate-100">
                    <td className="py-1.5 pr-3">{t.inc.toLocaleString('ja-JP')} 万円</td>
                    <td className="pr-3 tabular-nums">{man(t.d10)} 万円</td>
                    <td className="pr-3 tabular-nums">{man(t.d55)} 万円</td>
                    <td className="tabular-nums font-semibold">{man(t.d65)} 万円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/aoiro-koujo-75man-2027" className="text-primary hover:underline">青色申告特別控除は 2027 年分から 75 万・65 万・10 万円に（書面の 55 万円は廃止）</Link></li>
            <li><Link href="/blog/freelance-kaigyo-todoke" className="text-primary hover:underline">開業届と青色申告承認申請書の出し方</Link></li>
            <li><Link href="/blog/freelance-etax-how-to" className="text-primary hover:underline">初めての e-Tax 確定申告（65 万円控除の条件）</Link></li>
            <li><Link href="/blog/freelance-tax-prep" className="text-primary hover:underline">確定申告の準備と帳簿のつけ方</Link></li>
            <li><Link href="/tools/takehome" className="text-primary hover:underline">手取り計算シミュレーター</Link></li>
          </ul>
          <AffiliateBox title="青色申告の帳簿づけと e-Tax 申告をまとめて済ませるなら" ids={['mf-kakutei', 'yayoi-aoiro', 'freee-kaikei']} />
          <ExcelUpsell item="tax" />
          <ToolFaq items={FAQS} />
          <MoreTools current="/tools/aoiro" />
        </section>
      </main>
    </SiteShell>
  )
}
