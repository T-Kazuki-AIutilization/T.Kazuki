import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { ExcelUpsell } from '@/components/marketing/excel-upsell'
import { SITE_URL } from '@/lib/site'
import { TOKUTEI, TOKUTEI_INCOMES, TOKUTEI_SALARIES, tokuteiSaving } from '@/lib/tokutei'
import { TokuteiCalculator } from './calculator'

export const metadata: Metadata = {
  title: '特定親族特別控除の計算ツール｜大学生の子のバイト・業務委託でいくらまで？（無料・2026年分）| FreelanceOS',
  description:
    '19〜22 歳の子のアルバイト年収と業務委託（フリーランス）の売上・経費から合計所得を出し、親の特定扶養控除・特定親族特別控除の額と、親の所得税・住民税がいくら下がるかを計算。2026 年分の所得 62 万・85 万・123 万円の区切り、親の年収別の早見表つき。登録不要。',
  alternates: { canonical: '/tools/tokutei-shinzoku' },
  openGraph: { title: '特定親族特別控除の計算ツール（大学生の子のバイト・業務委託）| FreelanceOS', description: '子のバイト年収と業務委託の売上・経費から、親の特定扶養控除・特定親族特別控除と下がる税金を計算。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-tokutei-shinzoku.png', width: 1200, height: 630 }] },
}

const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })

const FAQS = [
  { q: '特定親族特別控除とは？', a: '19 歳以上 23 歳未満の子など（特定親族）の合計所得金額が、扶養控除の基準（2026 年分は 62 万円）を超えても、123 万円以下なら親が受けられる控除です。2025 年分から始まりました。子の所得 85 万円以下なら特定扶養控除と同じ 63 万円で、そこから段階的に減ります。' },
  { q: '大学生の子がアルバイトだけなら、年収いくらまで親の控除は満額？', a: '2026 年分は年収 159 万円以下（給与所得 85 万円以下）なら満額の 63 万円です。136 万円以下なら特定扶養控除、136 万円超 159 万円以下なら特定親族特別控除で、197 万円を超えると 0 円になります。' },
  { q: '業務委託（フリーランス）の場合は？', a: '業務委託の報酬には給与所得控除がないので、「売上 − 経費」がそのまま所得です。業務委託だけなら売上 − 経費 85 万円以下が満額、123 万円を超えると 0 円です。アルバイトと業務委託の両方がある場合は、給与所得と業務委託の所得を合計して判定します。' },
  { q: '親の年収が高いと受けられない？', a: '特定扶養控除・特定親族特別控除には、配偶者控除のような親の所得制限はありません。親が会社員でもフリーランスでも受けられます。フリーランスの親は確定申告で記入します。' },
  { q: '健康保険の扶養も同じ基準？', a: '違います。会社の健康保険では、19〜22 歳の子は 2025 年 10 月から年間収入 150 万円未満が基準です。業務委託の収入の数え方は健康保険組合ごとに異なります。親がフリーランスで国民健康保険の場合、扶養の仕組みはなく、子も加入者として保険料がかかります。' },
]

export default function TokuteiToolPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FreelanceOS 特定親族特別控除の計算ツール', url: `${SITE_URL}/tools/tokutei-shinzoku`, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' }, inLanguage: 'ja' }
  const matrix = TOKUTEI_SALARIES.map((s) => ({ s, cells: TOKUTEI_INCOMES.map((c) => tokuteiSaving(s * 10000, c * 10000).total) }))
  const rows: [string, string, string][] = [['62 万円以下（特定扶養控除）', '63 万円', '45 万円'], ...TOKUTEI.map(([lim, it, res], i): [string, string, string] => [`${man(i === 0 ? 620000 : TOKUTEI[i - 1][0])} 万円超 ${man(lim)} 万円以下`, `${man(it)} 万円`, `${man(res)} 万円`]), ['123 万円超', '0 円', '0 円']]
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">特定親族特別控除の計算ツール（大学生の子のアルバイト・業務委託） <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">19〜22 歳の子のアルバイト年収と業務委託（フリーランス）の売上・経費から合計所得金額を出し、親の特定扶養控除・特定親族特別控除の額と、親の所得税・住民税がいくら下がるかを計算します（2026 年分・年末調整の特定親族特別控除申告書の見積額にも使えます）。</p>
        </div>
        <TokuteiCalculator />

        <section className="mt-12">
          <h2 className="text-lg font-bold">子の合計所得金額別の控除額（2026 年分）</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">子の合計所得金額</th><th className="pr-3">所得税の控除</th><th>住民税の控除（2027 年度分）</th></tr></thead>
              <tbody>
                {rows.map(([a, b, c]) => (
                  <tr key={a} className="border-b border-slate-100"><td className="py-1.5 pr-3">{a}</td><td className="pr-3 tabular-nums">{b}</td><td className="tabular-nums">{c}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">子の所得 85 万円 ＝ アルバイトだけなら年収 159 万円、業務委託だけなら売上 − 経費 85 万円。123 万円 ＝ アルバイトなら年収 197 万円。</p>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-bold">早見表: 親の年収 × 子の合計所得金額で下がる親の税金（年間）</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">親の年収</th>{TOKUTEI_INCOMES.map((c) => <th key={c} className="pr-3 text-right">子の所得 {c} 万円</th>)}</tr></thead>
              <tbody>
                {matrix.map(({ s, cells }) => (
                  <tr key={s} className="border-b border-slate-100">
                    <td className="py-1.5 pr-3">{s.toLocaleString('ja-JP')} 万円</td>
                    {cells.map((c, i) => <td key={i} className="pr-3 text-right tabular-nums">{c > 0 ? `${man(c)} 万円` : '0 円'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">所得税（復興特別所得税込み）＋住民税の減少額。親は会社員、社会保険料は年収の 15%、ほかの控除なしで概算。子の所得 85 万円までは控除額が同じ 63 万円なので、親の税金の差は出ません。</p>
        </section>

        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/tokutei-shinzoku-gakusei-freelance" className="text-primary hover:underline">大学生の子が業務委託・フリーランスで稼いだら親の扶養は？（健康保険の扶養・年末調整の書き方）</Link></li>
            <li><Link href="/blog/side-job-nenmatsu-chosei-2026" className="text-primary hover:underline">2026 年の年末調整で何が変わる？基礎控除 104 万円と 136 万円の扶養</Link></li>
            <li><Link href="/tools/haigusha" className="text-primary hover:underline">配偶者控除の計算ツール（配偶者がフリーランス）</Link></li>
            <li><Link href="/blog/seimei-hoken-koujo-2026" className="text-primary hover:underline">生命保険料控除は 2026 年分から最大いくら？（23 歳未満の子がいる場合）</Link></li>
          </ul>
          <ExcelUpsell item="tax" />
          <ToolFaq items={FAQS} />
          <p className="mt-6 text-xs">前提: 2026 年分の所得税（年末調整）と 2027 年度分の住民税。子は 2026 年 12 月 31 日時点で 19〜22 歳、親と生計を一にし、親の事業専従者ではない場合。給与所得控除は 2026 年分（最低 74 万円）。親は会社員、社会保険料は年収の 15% で概算し、生命保険料控除・配偶者控除などは含みません。最終確認は勤務先の案内・国税庁のページでお願いします。</p>
          <MoreTools current="/tools/tokutei-shinzoku" />
        </section>
      </main>
    </SiteShell>
  )
}
