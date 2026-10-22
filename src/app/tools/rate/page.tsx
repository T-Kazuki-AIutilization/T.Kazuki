import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { RateCalculator } from './calculator'
import { RATE_TARGETS } from '@/lib/takehome'
import { SITE_URL } from '@/lib/site'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'

export const metadata: Metadata = {
  title: 'フリーランスの時間単価計算ツール（無料・登録不要）｜目標の手取り年収から必要単価を逆算 | FreelanceOS',
  description:
    '目標の手取り年収・経費・稼働時間を入れると、税金と保険料を含めて必要な年間売上と時間単価・日単価を逆算します。請求できる時間の割合も考慮。登録不要、入力は端末内にのみ保存。',
  alternates: { canonical: '/tools/rate' },
  openGraph: { title: '時間単価計算ツール（無料・登録不要）| FreelanceOS', description: '目標の手取り年収から必要な時間単価を逆算。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-rate.png', width: 1200, height: 630 }] },
}

const FAQS = [
  { q: 'フリーランスの時間単価の目安は？', a: '職種によりますが、Web 制作・コーディングで 5,000〜8,000 円、デザインで 5,000〜10,000 円、開発で 6,000〜12,000 円、ライティングで 3,000〜6,000 円が一般的な水準です。ただし相場より、自分の目標年収から逆算した単価を基準にするのがおすすめです。' },
  { q: '請求できる時間の割合はどれくらい？', a: '営業・見積・事務・学習・打ち合わせの待ち時間を除くと、実際に請求できるのは労働時間の 50〜70% が一般的です。継続案件が中心なら 70〜80%、新規開拓が多いと 50% 前後になります。' },
  { q: '日単価・月額で見積もる場合は？', a: '日単価は時間単価 × 8 時間で概算しています。月額固定の案件は、想定稼働時間 × 時間単価に、打ち合わせや修正対応のバッファを 10〜20% 上乗せすると、実績時給が下がりにくくなります。' },
  { q: '計算した単価が相場より高い場合は？', a: '作業時間を減らす（テンプレート化・専門特化）、請求できる時間の割合を上げる（継続案件を増やす）、単価の高い領域に移る、のいずれかで差を埋めます。既存の取引先には、更新時に単価の見直しを相談するのも有効です。' },
]

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
        <section className="mt-12 text-sm">
          <h2 className="text-base font-semibold">目標の手取り別に必要な売上・時間単価</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {RATE_TARGETS.map((x) => (
              <li key={x}><Link href={`/tools/rate/${x}`} className="inline-block rounded border px-2 py-1 text-xs hover:bg-slate-50">手取り {x.toLocaleString('ja-JP')}万円</Link></li>
            ))}
          </ul>
        </section>
        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/freelance-hourly-rate" className="text-primary hover:underline">フリーランスの時間単価の計算方法と目安【計算式と早見表つき】</Link></li>
            <li><Link href="/blog/freelance-rate-negotiation" className="text-primary hover:underline">単価交渉・値上げの伝え方（メール文例つき）</Link></li>
            <li><Link href="/blog/freelance-estimate-how-to" className="text-primary hover:underline">見積書の書き方</Link></li>
            <li><Link href="/tools/takehome" className="text-primary hover:underline">手取り計算シミュレーター（無料ツール）</Link></li>
          </ul>
          <ToolFaq items={FAQS} />
          <MoreTools current="/tools/rate" />
        </section>
      </main>
    </SiteShell>
  )
}
