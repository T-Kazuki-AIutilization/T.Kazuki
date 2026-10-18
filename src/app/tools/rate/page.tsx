import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { RateCalculator } from './calculator'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'フリーランスの時間単価計算ツール（無料・登録不要）｜目標の手取り年収から必要単価を逆算 | FreelanceOS',
  description:
    '目標の手取り年収・経費・稼働時間を入れると、税金と保険料を含めて必要な年間売上と時間単価・日単価を逆算します。請求できる時間の割合も考慮。登録不要、入力は端末内にのみ保存。',
  alternates: { canonical: '/tools/rate' },
  openGraph: { title: '時間単価計算ツール（無料・登録不要）| FreelanceOS', description: '目標の手取り年収から必要な時間単価を逆算。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-rate.png', width: 1200, height: 630 }] },
}

export default function RateToolPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FreelanceOS 時間単価計算ツール', url: `${SITE_URL}/tools/rate`, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' }, inLanguage: 'ja' }
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">時間単価計算ツール <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">「目標の手取り年収」から、税金・保険料・経費を上乗せした必要売上を求め、請求できる時間で割って時間単価を逆算します。時給 3,000 円で年収 600 万円に届かない理由が数字で分かります。</p>
        </div>
        <RateCalculator />
        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/freelance-hourly-rate" className="text-primary hover:underline">フリーランスの時間単価の計算方法と目安【計算式と早見表つき】</Link></li>
            <li><Link href="/blog/freelance-rate-negotiation" className="text-primary hover:underline">単価交渉・値上げの伝え方（メール文例つき）</Link></li>
            <li><Link href="/blog/freelance-estimate-how-to" className="text-primary hover:underline">見積書の書き方</Link></li>
            <li><Link href="/tools/takehome" className="text-primary hover:underline">手取り計算シミュレーター（無料ツール）</Link></li>
          </ul>
        </section>
      </main>
    </SiteShell>
  )
}
