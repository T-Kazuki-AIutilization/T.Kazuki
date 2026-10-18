import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { WithholdingCalculator } from './calculator'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: '源泉徴収税額の計算ツール（10.21%・無料）｜報酬額から計算・振込額から逆算 | FreelanceOS',
  description:
    'フリーランスの報酬にかかる源泉徴収税額（10.21%、100 万円超は 20.42%）を計算。消費税を分けて書いた場合の請求額、振込額からの税抜報酬の逆算にも対応。登録不要。',
  alternates: { canonical: '/tools/withholding' },
  openGraph: { title: '源泉徴収税額の計算ツール（無料）| FreelanceOS', description: '10.21% の源泉徴収税額を計算、振込額から逆算。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-withholding.png', width: 1200, height: 630 }] },
}

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
        </section>
      </main>
    </SiteShell>
  )
}
