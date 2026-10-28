import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { ExcelUpsell } from '@/components/marketing/excel-upsell'
import { SITE_URL } from '@/lib/site'
import { AOIRO_OPTIONS, HAIGUSHA_PROFITS, HAIGUSHA_SALARIES, haigushaSaving } from '@/lib/haigusha'
import { HaigushaCalculator } from './calculator'

export const metadata: Metadata = {
  title: '配偶者控除の計算ツール｜妻（夫）がフリーランス・個人事業主なら売上いくらまで？（無料・2026年分）| FreelanceOS',
  description:
    '配偶者の売上・経費・青色申告特別控除から合計所得金額を出し、配偶者控除・配偶者特別控除の額と、会社員の夫（妻）の所得税・住民税がいくら下がるかを計算。2026 年分の所得 62 万円・95 万円・133 万円の区切り、青色・白色別の売上の目安、年収別の早見表つき。登録不要。',
  alternates: { canonical: '/tools/haigusha' },
  openGraph: { title: '配偶者控除の計算ツール（フリーランスの配偶者向け・無料）| FreelanceOS', description: '配偶者の売上・経費から配偶者控除・配偶者特別控除と世帯の節税額を計算。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-haigusha.png', width: 1200, height: 630 }] },
}

const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })

const FAQS = [
  { q: '配偶者がフリーランスの場合、配偶者控除は年収（売上）で判定する？', a: 'いいえ。配偶者の合計所得金額で判定します。事業所得は「売上 − 経費 − 青色申告特別控除」なので、同じ売上でも経費や青色申告かどうかで結果が変わります。パートの給与もある場合は、給与所得（年収 − 給与所得控除）と合計します。' },
  { q: '2026 年分の配偶者控除の基準はいくら？', a: '配偶者の合計所得金額が 62 万円以下なら配偶者控除（38 万円、70 歳以上は 48 万円）、62 万円超〜133 万円以下なら配偶者特別控除です。配偶者特別控除は 95 万円以下まで満額の 38 万円で、そこから段階的に減ります。2025 年分までは配偶者控除の基準が 58 万円でした。控除を受ける本人の合計所得金額が 1,000 万円を超えると、どちらも受けられません。' },
  { q: '青色申告 65 万円控除なら、売上いくらまで配偶者控除を受けられる？', a: '売上から経費を引いた額が 127 万円（62 万円＋65 万円）以下なら配偶者控除、160 万円以下なら配偶者特別控除の満額 38 万円、198 万円以下なら配偶者特別控除を受けられます（ほかに所得がない場合）。' },
  { q: '健康保険の扶養も同じ基準？', a: '違います。会社の健康保険の扶養は「今後 1 年間の収入見込みが 130 万円未満」などの基準で、個人事業主の収入の数え方は健康保険組合ごとに異なります。青色申告特別控除は引けないのが一般的で、個人事業主を扶養に入れない組合もあります。' },
  { q: 'フリーランス同士の夫婦でも使える？', a: '控除を受ける側がフリーランスでも、確定申告で配偶者控除・配偶者特別控除を受けられます。このツールは本人を会社員として税額を計算しているので、控除額の判定（配偶者控除か特別控除か、いくらか）を参考にしてください。' },
]

export default function HaigushaToolPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FreelanceOS 配偶者控除の計算ツール', url: `${SITE_URL}/tools/haigusha`, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' }, inLanguage: 'ja' }
  const matrix = HAIGUSHA_SALARIES.map((s) => ({ s, cells: HAIGUSHA_PROFITS.map((p) => haigushaSaving(s * 10000, Math.max(0, p * 10000 - 650000)).total) }))
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">配偶者控除の計算ツール（配偶者がフリーランス・個人事業主の場合） <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">配偶者の売上・経費・申告方法から合計所得金額を出し、配偶者控除・配偶者特別控除の額と、会社員の夫（妻）の所得税・住民税がいくら下がるかを計算します（2026 年分・年末調整の配偶者控除等申告書の見積額にも使えます）。</p>
        </div>
        <HaigushaCalculator />

        <section className="mt-12">
          <h2 className="text-lg font-bold">申告方法別: 配偶者の「売上 − 経費」の目安（ほかに所得がない場合）</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">申告方法</th><th className="pr-3">配偶者控除（所得 62 万円以下）</th><th className="pr-3">満額 38 万円（95 万円以下）</th><th>配偶者特別控除（133 万円以下）</th></tr></thead>
              <tbody>
                {AOIRO_OPTIONS.map((o) => (
                  <tr key={o.aoiro} className="border-b border-slate-100">
                    <td className="py-1.5 pr-3">{o.label}</td>
                    <td className="pr-3 tabular-nums">{man(620000 + o.aoiro)} 万円以下</td>
                    <td className="pr-3 tabular-nums">{man(950000 + o.aoiro)} 万円以下</td>
                    <td className="tabular-nums">{man(1330000 + o.aoiro)} 万円以下</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">青色 65 万円控除は複式簿記＋e-Tax（または優良な電子帳簿）、55 万円は複式簿記で書面提出、10 万円は簡易簿記の場合。青色申告特別控除は「売上 − 経費」が控除額より少なければその額までです。</p>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-bold">早見表: 会社員の年収 × 配偶者の「売上 − 経費」（青色 65 万円控除）で下がる税金（年間）</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">本人の年収</th>{HAIGUSHA_PROFITS.map((p) => <th key={p} className="pr-3 text-right">{p} 万円</th>)}</tr></thead>
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
          <p className="mt-2 text-xs text-muted-foreground">所得税（復興特別所得税込み）＋住民税の減少額。社会保険料は年収の 15%、ほかの控除なしで概算。配偶者の売上 − 経費 160 万円（所得 95 万円）までは控除額が同じ 38 万円なので、世帯の税金の差は出ません。</p>
        </section>

        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/freelance-haigusha-koujo" className="text-primary hover:underline">妻（夫）がフリーランスでも配偶者控除は受けられる？（健康保険の扶養との違い・年末調整の書き方）</Link></li>
            <li><Link href="/blog/side-job-nenmatsu-chosei-2026" className="text-primary hover:underline">2026 年の年末調整で何が変わる？基礎控除 104 万円と 136 万円の扶養</Link></li>
            <li><Link href="/tools/aoiro" className="text-primary hover:underline">青色申告の節税額シミュレーター</Link></li>
            <li><Link href="/tools/tokutei-shinzoku" className="text-primary hover:underline">特定親族特別控除の計算ツール（大学生の子のバイト・業務委託）</Link></li>
            <li><Link href="/blog/freelance-kaigyo-todoke" className="text-primary hover:underline">開業届と青色申告承認申請書の出し方</Link></li>
          </ul>
          <ExcelUpsell item="tax" />
          <ToolFaq items={FAQS} />
          <p className="mt-6 text-xs">前提: 2026 年分の所得税（年末調整）と 2027 年度分の住民税。配偶者控除・配偶者特別控除の額は本人の合計所得 900 万円以下・950 万円以下・1,000 万円以下で区分。本人は会社員として給与所得控除（2026 年分）、社会保険料は年収の 15% で概算し、生命保険料控除・扶養控除などは含みません。最終確認は勤務先の案内・国税庁のページでお願いします。</p>
          <MoreTools current="/tools/haigusha" />
        </section>
      </main>
    </SiteShell>
  )
}
