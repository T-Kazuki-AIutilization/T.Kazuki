import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { WithholdingCalculator } from './calculator'
import { SITE_URL } from '@/lib/site'
import { ToolFaq } from '@/components/marketing/tool-faq'

export const metadata: Metadata = {
  title: '源泉徴収税額の計算ツール（10.21%・無料）｜報酬額から計算・振込額から逆算 | FreelanceOS',
  description:
    'フリーランスの報酬にかかる源泉徴収税額（10.21%、100 万円超は 20.42%）を計算。消費税を分けて書いた場合の請求額、振込額からの税抜報酬の逆算にも対応。登録不要。',
  alternates: { canonical: '/tools/withholding' },
  openGraph: { title: '源泉徴収税額の計算ツール（無料）| FreelanceOS', description: '10.21% の源泉徴収税額を計算、振込額から逆算。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-withholding.png', width: 1200, height: 630 }] },
}

const FAQS = [
  { q: '源泉徴収の対象になる報酬は？', a: '原稿料・ライティング・挿絵、デザイン料、講演料・講師料、翻訳・通訳、写真・映像の撮影料、士業の報酬などです。プログラミング・システム開発・コーディング、Web サイトの保守運用、事務作業は対象外です。' },
  { q: '消費税は源泉徴収の対象に含まれる？', a: '請求書で報酬額と消費税額を分けて記載していれば、税抜の報酬額だけが対象です。分けずに税込額だけを書くと、税込額が対象になり源泉徴収税額が増えます。' },
  { q: '100 万円を超える場合の計算は？', a: '100 万円以下の部分に 10.21%、100 万円を超える部分に 20.42% がかかります。式は（報酬額 − 100 万円）× 20.42% ＋ 102,100 円です。1 円未満は切り捨てます。' },
  { q: '源泉徴収された分は戻ってくる？', a: '源泉徴収税額は所得税の前払いで、確定申告で 1 年分の所得税と精算されます。払いすぎていれば還付されます。経費が多い年や所得が少ない年は還付になることが多いです。' },
  { q: '個人のクライアントから全額振り込まれた', a: '従業員を雇っていない個人には源泉徴収の義務がないため、全額振り込まれるのが正しい扱いです。法人なのに差し引かれていない場合も、確定申告で正しい所得税を納めれば問題ありません。' },
]

export default function WithholdingToolPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FreelanceOS 源泉徴収計算ツール', url: `${SITE_URL}/tools/withholding`, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' }, inLanguage: 'ja' }
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">源泉徴収税額の計算ツール <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">原稿料・デザイン料・講演料などの報酬にかかる源泉徴収税額（10.21%、100 万円を超える部分は 20.42%）を計算します。振込額からの逆算もできます。</p>
        </div>
        <WithholdingCalculator />
        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/freelance-withholding-tax" className="text-primary hover:underline">フリーランスの源泉徴収とは？対象になる報酬・計算方法・確定申告での還付</Link></li>
            <li><Link href="/blog/freelance-invoice-how-to" className="text-primary hover:underline">請求書の書き方（インボイス対応・源泉徴収の計算）</Link></li>
            <li><Link href="/tools/invoice" className="text-primary hover:underline">請求書作成ツール（無料）</Link></li>
          </ul>
          <ToolFaq items={FAQS} />
        </section>
      </main>
    </SiteShell>
  )
}
