import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { ExcelUpsell } from '@/components/marketing/excel-upsell'
import { AffiliateBox, AdNotice } from '@/components/marketing/affiliate-box'
import { SITE_URL } from '@/lib/site'
import { AnbunCalculator } from './calculator'

export const metadata: Metadata = {
  title: '家事按分の計算ツール｜家賃・電気代・通信費を何％経費にできる？（無料）| FreelanceOS',
  description:
    '在宅のフリーランス・個人事業主向けに、家賃（面積）・電気代（時間）・ネット回線と携帯電話（使用割合）の家事按分を計算。年間の経費額と、所得税・住民税・国保が下がる目安を表示。按分の考え方と注意点つき。登録不要。',
  alternates: { canonical: '/tools/anbun' },
  openGraph: { title: '家事按分の計算ツール（無料）| FreelanceOS', description: '家賃・電気代・通信費の按分と経費額を計算。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-anbun.png', width: 1200, height: 630 }] },
}

const FAQS = [
  { q: '家事按分とは？', a: '自宅兼事務所の家賃や光熱費、私用と兼用している携帯電話のように、仕事とプライベートの両方に使う支出のうち、仕事に使った分だけを経費にすることです。仕事に使った割合は、面積・時間・使用割合など、説明できる基準で決めます。' },
  { q: '按分の割合に決まりはある？', a: '何％と決まった上限はなく、実態に合った合理的な割合であることが求められます。家賃は「仕事専用のスペースの面積 ÷ 住居の面積」、電気代は「仕事をする時間 ÷ 起きている時間」などがよく使われます。根拠（間取り図や作業時間のメモ）を残しておくと、税務署から聞かれたときに説明できます。' },
  { q: '白色申告でも按分できる？', a: 'できます。家事関連費を経費にできるのは、業務に必要な部分を明らかに区分できる場合です。白色申告では業務に使う部分が 50% を超えるかで判定するのが原則ですが、50% 以下でも業務に必要な部分を明らかに区分できれば、その部分を経費にしてよいとされています（所得税基本通達 45-2）。青色申告なら、取引の記録などで業務に直接必要だったことが明らかな部分を経費にできます。' },
  { q: '持ち家でも家賃のように経費にできる？', a: '自分に家賃を払うことはできませんが、住宅の減価償却費、固定資産税、住宅ローンの利息部分などを仕事で使う割合で按分して経費にできます。住宅ローン控除を受けている場合は、事業で使う割合によって控除額が変わることがあるため注意が必要です。' },
  { q: 'どのくらい節税になる？', a: '経費が増えると、その額に所得税率（5〜45%）＋住民税 10%＋国民健康保険の所得割（10% 前後）をかけた分だけ負担が下がります。所得税率 10% の人なら、経費 1 万円あたり約 3,000 円です。' },
]

export default function AnbunToolPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FreelanceOS 家事按分の計算ツール', url: `${SITE_URL}/tools/anbun`, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' }, inLanguage: 'ja' }
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">家事按分の計算ツール <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
          <AdNotice ids={['mf-kakutei', 'yayoi-aoiro', 'freee-kaikei']} />
          <p className="mt-2 text-sm text-muted-foreground">自宅で仕事をするフリーランス・個人事業主向けに、家賃・電気代・ネット回線・携帯電話のうち経費にできる額と、税金・保険料が下がる目安を計算します。</p>
        </div>
        <AnbunCalculator />
        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/kaji-anbun-freelance" className="text-primary hover:underline">家事按分のやり方（白色申告の 50% の基準・実家や持ち家の場合・仕訳）</Link></li>
            <li><Link href="/blog/freelance-expenses-list" className="text-primary hover:underline">フリーランスの経費一覧（家事按分の目安つき）</Link></li>
            <li><Link href="/blog/freelance-tax-prep" className="text-primary hover:underline">確定申告の準備と帳簿のつけ方</Link></li>
            <li><Link href="/tools/aoiro" className="text-primary hover:underline">青色申告の節税額シミュレーター</Link></li>
          </ul>
          <AffiliateBox title="按分した経費の記録と確定申告をまとめて済ませるなら" ids={['mf-kakutei', 'yayoi-aoiro', 'freee-kaikei']} />
          <ExcelUpsell item="tax" />
          <ToolFaq items={FAQS} />
          <MoreTools current="/tools/anbun" />
        </section>
      </main>
    </SiteShell>
  )
}
