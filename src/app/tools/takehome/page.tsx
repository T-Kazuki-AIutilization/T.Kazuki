import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { TakeHomeCalculator } from './calculator'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'フリーランスの手取り計算シミュレーター（無料・登録不要）｜所得税・住民税・国保・年金を一括概算【2026年分】 | FreelanceOS',
  description:
    '売上と経費を入れるだけで、フリーランス・個人事業主の手取りを概算。所得税（基礎控除の 2026 年分特例を反映）・住民税・国民健康保険・国民年金・個人事業税・消費税（2 割特例）の内訳と、源泉徴収との差額（還付の目安）を表示。登録不要、入力は端末内にのみ保存。',
  alternates: { canonical: '/tools/takehome' },
  openGraph: {
    title: 'フリーランスの手取り計算シミュレーター（無料・登録不要）| FreelanceOS',
    description: '売上と経費を入れるだけで、所得税・住民税・国保・年金を一括概算。2026 年分対応。',
    type: 'website',
    locale: 'ja_JP',
    images: [{ url: '/blog/og/tools-takehome.png', width: 1200, height: 630 }],
  },
}

export default function TakeHomeToolPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'FreelanceOS 手取り計算シミュレーター',
    url: `${SITE_URL}/tools/takehome`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
    description: 'フリーランスの売上と経費から、所得税・住民税・国保・年金・事業税・消費税と手取りを概算する無料ツール。',
    inLanguage: 'ja',
  }
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">フリーランスの手取り計算シミュレーター <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">売上と経費を入れるだけで、所得税・住民税・国民健康保険・国民年金・個人事業税・消費税を差し引いた年間・月間の手取りを概算します。2026 年分（2027 年 3 月申告）の税制を反映。</p>
        </div>
        <TakeHomeCalculator />
        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">計算の前提</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>所得税は速算表（5〜45%）と復興特別所得税 2.1%。基礎控除は 2025 年改正による 2026 年分までの上乗せ（合計所得 132 万円以下 95 万円、〜336 万円 88 万円、〜489 万円 68 万円、〜655 万円 63 万円、それ以上 58 万円）を反映。</li>
            <li>住民税は所得割 10% ＋ 均等割 5,000 円（森林環境税込み）、基礎控除 43 万円、調整控除 2,500 円。翌年 6 月からの納付分を当年の負担として表示。</li>
            <li>国民健康保険は（所得 − 43 万円）× 所得割率 ＋ 均等割 6 万円（1 人分）で概算、年間上限 109 万円。自治体で大きく異なるため、正確な額は自治体の試算ページで確認してください。</li>
            <li>国民年金は 2026 年度の月額 17,920 円 × 12 か月。前納割引や免除は考慮しません。</li>
            <li>個人事業税は（青色控除前の所得 − 事業主控除 290 万円）× 税率。消費税は 2 割特例（売上の消費税 × 20%）で概算。本則課税・簡易課税は対象外。</li>
            <li>概算です。実際の税額は申告内容や自治体の料率で変わります。最終確認は税理士等にご相談ください。</li>
          </ul>
          <h2 className="mt-8 text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/freelance-take-home-pay" className="text-primary hover:underline">フリーランスの手取りはいくら？売上別の目安と計算方法</Link></li>
            <li><Link href="/blog/freelance-health-insurance-pension" className="text-primary hover:underline">国民健康保険と国民年金はいくら？所得別の目安</Link></li>
            <li><Link href="/blog/freelance-tax-calendar" className="text-primary hover:underline">税金・納付スケジュール年間カレンダー</Link></li>
            <li><Link href="/blog/freelance-expenses-list" className="text-primary hover:underline">経費になるもの・ならないもの一覧</Link></li>
            <li><Link href="/tools/invoice" className="text-primary hover:underline">請求書作成ツール（無料・登録不要）</Link></li>
          </ul>
        </section>
      </main>
    </SiteShell>
  )
}
