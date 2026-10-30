import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { ExcelUpsell } from '@/components/marketing/excel-upsell'
import { SITE_URL } from '@/lib/site'
import { calc } from '@/lib/shohizei'
import { ShohizeiCalculator } from './calculator'

export const metadata: Metadata = {
  title: '消費税の計算ツール（2 割特例・3 割特例・簡易課税）｜インボイス登録した個人事業主の納税額と申告書の書き方（無料）| FreelanceOS',
  description:
    'インボイス登録したフリーランス・個人事業主の消費税の納税額を、売上（税込）から計算。2 割特例（2026 年分まで）・3 割特例（2027・2028 年分）・簡易課税を比較し、付表 6 と申告書第一表に書く課税標準額・消費税額・特別控除税額・地方消費税まで表示。売上別の早見表つき。登録不要。',
  alternates: { canonical: '/tools/shohizei' },
  openGraph: { title: '消費税の計算ツール（2 割特例・3 割特例・簡易課税）| FreelanceOS', description: '売上（税込）から消費税の納税額と、付表 6・申告書に書く額を計算。2 割特例は 2026 年分まで、2027・2028 年分は 3 割特例。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-shohizei.png', width: 1200, height: 630 }] },
}

const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })

const FAQS = [
  { q: '2 割特例の納税額はどう計算する？', a: '売上（税込）を税抜にして 1,000 円未満を切り捨てた課税標準額に 7.8%（消費税の国税分）を掛け、その 80% を「特別控除税額」として差し引きます。残り（100 円未満切り捨て）が消費税で、その 22/78 が地方消費税です。税抜売上 500 万円なら、消費税 78,000 円 ＋ 地方消費税 22,000 円 ＝ 10 万円で、売上にかかる消費税（50 万円）の 2 割です。' },
  { q: '2 割特例はいつまで？', a: '2 割特例を使えるのは 2026 年分（2027 年 3 月 31 日までに申告する分）までです。令和 8 年度の税制改正で、個人事業者は 2027・2028 年分に「3 割特例」（売上の消費税 × 30%）を使えるようになりました。2029 年分からは簡易課税か本則課税（一般課税）です。' },
  { q: '経費の消費税は関係ない？', a: '2 割特例・3 割特例・簡易課税では、経費や仕入れにかかった消費税を集計する必要はありません。売上の消費税から一定割合を差し引いて計算します。経費の消費税を実額で差し引く本則課税（一般課税）は、設備投資が多い年などに有利になることがありますが、このツールでは計算していません。' },
  { q: '源泉徴収された報酬はどの額で入れる？', a: '源泉徴収される前の報酬額（請求額、税込）で入れます。消費税の売上は、源泉徴収とは関係なく、取引の対価の額で計算します。' },
  { q: '簡易課税と特例のどちらが得？', a: '簡易課税の納税額は「売上の消費税 ×（1 − みなし仕入率）」です。第 5 種（サービス業など）は 50% なので、デザイン・ライティング・開発・コンサルなどの仕事では 2 割特例・3 割特例のほうが少なくなります。卸売業（第 1 種・90%）や小売業（第 2 種・80%）は簡易課税のほうが少なくなることがあり、ツールで比べられます。' },
  { q: '申告と納付の期限は？', a: '個人事業者は翌年 3 月 31 日です。2026 年分は 2027 年 3 月 31 日（水）までに申告・納付します。所得税の期限（3 月 15 日）とは別です。申告書を出しても納付書は届かないので、振替納税（口座引き落とし）などで期限までに納めます。' },
]

const SALES = [3000000, 5000000, 8000000, 10000000]

export default function ShohizeiToolPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FreelanceOS 消費税の計算ツール（2 割特例・3 割特例・簡易課税）', url: `${SITE_URL}/tools/shohizei`, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' }, inLanguage: 'ja' }
  const rows = SALES.map((s) => {
    const std = Math.round(s * 1.1)
    const r = (rate: number) => calc({ std, stdRefund: 0, red: 0, redRefund: 0, deductionRate: rate }).total
    return { s, niwari: r(0.8), sanwari: r(0.7), service: r(0.5), retail: r(0.8) }
  })
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">消費税の計算ツール（2 割特例・3 割特例・簡易課税） <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">インボイス登録したフリーランス・個人事業主の消費税の納税額を、1 年分の売上（税込）から計算します。付表 6 と申告書第一表に書く課税標準額・消費税額・特別控除税額・地方消費税もわかります。</p>
        </div>
        <ShohizeiCalculator />

        <section className="mt-12">
          <h2 className="text-lg font-bold">早見表: 税抜売上別の消費税の納税額（年額）</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">税抜売上</th><th className="pr-3 text-right">2 割特例（2026 年分）</th><th className="pr-3 text-right">3 割特例（2027・28 年分）</th><th className="pr-3 text-right">簡易課税・サービス業</th><th className="text-right">簡易課税・小売業</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.s} className="border-b border-slate-100">
                    <td className="py-1.5 pr-3">{(r.s / 10000).toLocaleString('ja-JP')} 万円</td>
                    <td className="pr-3 text-right tabular-nums">{man(r.niwari)} 万円</td>
                    <td className="pr-3 text-right tabular-nums">{man(r.sanwari)} 万円</td>
                    <td className="pr-3 text-right tabular-nums">{man(r.service)} 万円</td>
                    <td className="text-right tabular-nums">{man(r.retail)} 万円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">全て標準税率（10%）、値引き・返品なしの場合。消費税と地方消費税の合計。2 割特例・3 割特例は、基準期間（2 年前）の課税売上高が 1,000 万円以下などの要件を満たす個人事業者が対象です。</p>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-bold">申告する年分と使える計算方法</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">年分</th><th className="pr-3">申告・納付の期限</th><th>インボイス登録した個人の計算方法</th></tr></thead>
              <tbody>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">2026 年分</td><td className="pr-3">2027 年 3 月 31 日（水）</td><td>2 割特例（売上の消費税 × 20%）、簡易課税、本則課税</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">2027・2028 年分</td><td className="pr-3">翌年 3 月 31 日</td><td>3 割特例（売上の消費税 × 30%）、簡易課税、本則課税</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">2029 年分以降</td><td className="pr-3">翌年 3 月 31 日</td><td>簡易課税（届出が必要）、本則課税</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/shohizei-shinkoku-2wari-yarikata" className="text-primary hover:underline">消費税の確定申告のやり方（2 割特例）。付表 6 と申告書の書き方、期限と納付</Link></li>
            <li><Link href="/blog/freelance-invoice-3wari-tokurei" className="text-primary hover:underline">2 割特例は 2026 年分で終了。2027 年からの 3 割特例で消費税はいくら増える？</Link></li>
            <li><Link href="/blog/freelance-invoice-registration" className="text-primary hover:underline">フリーランスはインボイス登録すべき？判断基準と登録しない場合の値引き交渉</Link></li>
            <li><Link href="/tools/takehome" className="text-primary hover:underline">手取り計算シミュレーター（消費税を含めた手取り）</Link></li>
          </ul>
          <ExcelUpsell item="takehome" />
          <ToolFaq items={FAQS} />
          <p className="mt-6 text-xs">前提: 国税庁「2 割特例用 消費税及び地方消費税の確定申告の手引き」の付表 6（簡易版）の計算方法（課税標準額は税率ごとに 1,000 円未満、差引税額と地方消費税は 100 円未満を切り捨て）と、令和 8 年度税制改正の 3 割特例（消費税 Q&A 問 117-3）。簡易課税は 1 種類の事業だけの場合のみなし仕入率で計算しています。貸倒れ、中間納付、旧税率、本則課税（一般課税）は含みません。最終的な税額は申告書で確認してください。</p>
          <MoreTools current="/tools/shohizei" />
        </section>
      </main>
    </SiteShell>
  )
}
