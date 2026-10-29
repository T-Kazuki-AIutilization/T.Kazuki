import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { ExcelUpsell } from '@/components/marketing/excel-upsell'
import { SITE_URL } from '@/lib/site'
import { JIGYOZEI_INCOMES, jigyozei } from '@/lib/jigyozei'
import { JigyozeiCalculator } from './calculator'

export const metadata: Metadata = {
  title: '個人事業税の計算ツール｜いくらから・業種別の税率・青色申告特別控除は引けない（無料）| FreelanceOS',
  description:
    'フリーランス・個人事業主の個人事業税を、業種（デザイン業・請負業・コンサルタント業など）と売上・経費から計算。事業主控除 290 万円、青色申告特別控除を引かない計算、開業年の月割、8 月・11 月の納付額まで。所得別の早見表つき。登録不要。',
  alternates: { canonical: '/tools/jigyozei' },
  openGraph: { title: '個人事業税の計算ツール（業種別・いくらから）| FreelanceOS', description: '業種と売上・経費から個人事業税と 8 月・11 月の納付額を計算。事業主控除 290 万円、青色申告特別控除は引かない。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-jigyozei.png', width: 1200, height: 630 }] },
}

const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })

const FAQS = [
  { q: '個人事業税はいくらからかかる？', a: '法定業種に当たる事業で、事業所得（青色申告特別控除を引く前の所得）が事業主控除の 290 万円を超えるとかかります。税率は多くの業種で 5% で、290 万円を超えた分にかかります。たとえば売上 − 経費が 500 万円なら、（500 万 − 290 万円）× 5% ＝ 10.5 万円です。' },
  { q: '青色申告特別控除は引けない？', a: '引けません。個人事業税は青色申告特別控除を引く前の所得で計算します。確定申告書の所得が 435 万円（青色 65 万円控除の後）なら、個人事業税の計算では 500 万円として扱います。青色事業専従者給与（白色申告は事業専従者控除）と、青色申告者の損失の繰越控除（3 年間）は引けます。' },
  { q: 'エンジニア・ライター・イラストレーターは対象？', a: '法定業種に当たるかどうかは、仕事の実態をもとに都道府県が判断します。ライター（文筆業）や画家などの芸術家は法定業種に含まれていないため、原則として対象外です。エンジニアは、成果物の完成を請け負う契約なら「請負業」として課税されることが多い一方、契約の形態によって判断が分かれます。8 月ごろに届く納税通知書の業種を確認し、疑問があれば都道府県税事務所に相談してください。' },
  { q: 'いつ、どうやって払う？', a: '前年の所得をもとに都道府県が計算し、8 月ごろ納税通知書が届きます。納期は 8 月（第 1 期）と 11 月（第 2 期）の 2 回で、税額が 1 万円以下なら 8 月に全額です。確定申告をしていれば、個人事業税の申告は別に要りません（確定申告書の「事業税に関する事項」を記入）。' },
  { q: '個人事業税は経費になる？', a: 'なります。払った年の経費（租税公課）です。2026 年分の所得に対して 2027 年 8 月・11 月に払う個人事業税は、2027 年分の経費になります。所得税・住民税は経費になりません。' },
  { q: '開業した年は？', a: '事業主控除は、事業をしていた月数で月割りになります。たとえば 7 月に開業した年は 6 か月分で 145 万円です。1 か月に満たない月は 1 か月として数えます。' },
]

export default function JigyozeiToolPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FreelanceOS 個人事業税の計算ツール', url: `${SITE_URL}/tools/jigyozei`, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' }, inLanguage: 'ja' }
  const rows = JIGYOZEI_INCOMES.map((m) => ({ m, five: jigyozei({ profit: m * 10000, months: 12, rate: 0.05 }), three: jigyozei({ profit: m * 10000, months: 12, rate: 0.03 }) }))
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">個人事業税の計算ツール（業種別・いくらから） <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">業種と 1 年間の売上・経費から、フリーランス・個人事業主の個人事業税と、8 月・11 月に払う額の目安を計算します。事業主控除 290 万円、青色申告特別控除を引かない計算、開業した年の月割に対応しています。</p>
        </div>
        <JigyozeiCalculator />

        <section className="mt-12">
          <h2 className="text-lg font-bold">早見表: 事業所得別の個人事業税（年額）</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">売上 − 経費（青色控除の前）</th><th className="pr-3">確定申告書の所得（青色 65 万円控除の場合）</th><th className="pr-3 text-right">税率 5% の業種</th><th className="text-right">税率 3% の業種</th></tr></thead>
              <tbody>
                {rows.map(({ m, five, three }) => (
                  <tr key={m} className="border-b border-slate-100">
                    <td className="py-1.5 pr-3">{m.toLocaleString('ja-JP')} 万円</td>
                    <td className="pr-3">{(m - 65).toLocaleString('ja-JP')} 万円</td>
                    <td className="pr-3 text-right tabular-nums">{five.tax > 0 ? `${man(five.tax)} 万円` : '0 円'}</td>
                    <td className="text-right tabular-nums">{three.tax > 0 ? `${man(three.tax)} 万円` : '0 円'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">1 年間事業をしていた場合。事業主控除 290 万円を引き、課税所得は 1,000 円未満、税額は 100 円未満を切り捨て。</p>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-bold">業種と税率（法定業種 70 業種）</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">区分</th><th className="pr-3">フリーランスに多い業種の例</th><th>税率</th></tr></thead>
              <tbody>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">第 1 種事業（37 業種）</td><td className="pr-3">物品販売業、請負業、印刷業、出版業、写真業、広告業、周旋業、代理業、仲立業、運送業、不動産貸付業、飲食店業 など</td><td>5%</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">第 2 種事業（3 業種）</td><td className="pr-3">畜産業、水産業、薪炭製造業</td><td>4%</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">第 3 種事業（30 業種）</td><td className="pr-3">デザイン業、コンサルタント業、設計監督者業、弁護士業、税理士業、行政書士業、社会保険労務士業、理容業、美容業 など</td><td>5%</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">第 3 種事業のうち</td><td className="pr-3">あん摩・マッサージ・指圧・はり・きゅう・柔道整復など医業に類する事業、装蹄師業</td><td>3%</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">対象外</td><td className="pr-3">法定業種に当たらない事業（文筆業、画家などの芸術家 など）、農業・林業</td><td>なし</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">どの業種に当たるかは、仕事の実態をもとに都道府県が判断します。</p>
        </section>

        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/freelance-tax-calendar" className="text-primary hover:underline">フリーランスの税金・納付スケジュール年間カレンダー（個人事業税は 8 月・11 月）</Link></li>
            <li><Link href="/blog/yotei-nozei-gengaku-shinsei" className="text-primary hover:underline">予定納税の第 2 期（11 月）は減額できる？2026 年は 11 月 16 日までに申請</Link></li>
            <li><Link href="/tools/takehome" className="text-primary hover:underline">フリーランスの手取り計算（所得税・住民税・国保・個人事業税をまとめて）</Link></li>
            <li><Link href="/tools/aoiro" className="text-primary hover:underline">青色申告の節税額シミュレーター</Link></li>
          </ul>
          <ExcelUpsell item="cashflow" />
          <ToolFaq items={FAQS} />
          <p className="mt-6 text-xs">前提: 地方税法の個人事業税の計算方法（事業主控除 290 万円、税率 5%・4%・3%）。課税所得は 1,000 円未満、税額は 100 円未満を切り捨てて概算しています。年の途中の開業・廃業の事業主控除は月割り（1,000 円未満切り上げ）で概算。損失の繰越控除、白色申告の事業専従者控除、不動産所得、社会保険診療報酬の非課税などは含みません。最終的な税額は都道府県から届く納税通知書でご確認ください。</p>
          <MoreTools current="/tools/jigyozei" />
        </section>
      </main>
    </SiteShell>
  )
}
