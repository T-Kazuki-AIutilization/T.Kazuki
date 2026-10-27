import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { ExcelUpsell } from '@/components/marketing/excel-upsell'
import { SITE_URL } from '@/lib/site'
import { FukugyoCalculator } from './calculator'
import { sideJobTax, FUKUGYO_SALARIES, FUKUGYO_SIDES } from '@/lib/fukugyo'

export const metadata: Metadata = {
  title: '副業の税金計算ツール｜会社員の副業でいくら税金が増える？（無料・2026年分）| FreelanceOS',
  description:
    '会社員の年収と副業の売上・経費を入れるだけで、副業で増える所得税・住民税と手元に残る額を計算。年収 300 万〜1,000 万円 × 副業所得 20 万〜200 万円の早見表つき。20 万円ルールにも対応。登録不要。',
  alternates: { canonical: '/tools/fukugyo' },
  openGraph: { title: '副業の税金計算ツール（無料）| FreelanceOS', description: '副業で増える所得税・住民税を計算。早見表つき。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-fukugyo.png', width: 1200, height: 630 }] },
}

const FAQS = [
  { q: '副業の税金はどう計算される？', a: '副業の所得（売上 − 経費）は会社の給与所得と合算され、その合計に所得税（5〜45%）と住民税（10%）がかかります。給与ですでに使っている税率の上に乗るため、年収が高い人ほど副業 1 円あたりの税金は多くなります。' },
  { q: '20 万円以下なら税金はかからない？', a: '会社で年末調整を受けている人は、副業の所得が 20 万円以下なら所得税の確定申告が不要で、その分の所得税はかかりません。ただし住民税にはこのルールがなく、市区町村への申告が必要で住民税は増えます。医療費控除などで確定申告をする年は、20 万円以下の副業所得も申告に含めます。' },
  { q: '副業で社会保険料は増える？', a: '会社員の健康保険・厚生年金の保険料は会社の給与で決まるため、副業（業務委託や個人の仕事）の所得では増えません。ただし副業先でも雇用されて給与を受け取り、一定の条件を満たすとその勤務先でも社会保険に加入することがあります。' },
  { q: '会社に副業がばれないようにするには？', a: '住民税は通常、会社の給与から天引きされ、副業の分が増えると会社が気づくことがあります。確定申告書の住民税の欄で、給与以外の所得の住民税を「自分で納付（普通徴収）」にすると、副業分の住民税は自宅に届く納付書で払えます。ただし自治体の運用によっては切り替わらないこともあります。' },
  { q: '経費にできるものは？', a: '副業のために使った費用（パソコン・ソフト・通信費の業務分・書籍・交通費など）は経費にできます。自宅の家賃や光熱費は業務で使う割合だけを按分します。領収書や明細は保存しておきましょう。' },
]

const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })

export default function FukugyoToolPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FreelanceOS 副業の税金計算ツール', url: `${SITE_URL}/tools/fukugyo`, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' }, inLanguage: 'ja' }
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">副業の税金計算ツール <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">会社員の年収と副業の売上・経費から、副業で増える所得税・住民税と、手元に残る額を計算します（2026 年分）。</p>
        </div>
        <FukugyoCalculator />

        <section className="mt-12">
          <h2 className="text-lg font-bold">早見表: 副業で増える税金（所得税＋住民税）</h2>
          <p className="mt-1 text-xs text-muted-foreground">縦が会社の年収（額面）、横が副業の所得（売上 − 経費）。社会保険料は年収の 15%、独身・扶養なしで概算。20 万円は 20 万円ルールで所得税 0 として計算（住民税のみ）。</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">年収 ＼ 副業の所得</th>{FUKUGYO_SIDES.map((s) => <th key={s} className="pr-3">{s} 万円</th>)}</tr></thead>
              <tbody>
                {FUKUGYO_SALARIES.map((sal) => (
                  <tr key={sal} className="border-b border-slate-100">
                    <td className="py-1.5 pr-3">{sal.toLocaleString('ja-JP')} 万円</td>
                    {FUKUGYO_SIDES.map((s) => {
                      const r = sideJobTax(sal * 10000, s * 10000)
                      return <td key={s} className="pr-3 tabular-nums">{man(r.total)} 万円 <span className="text-xs text-muted-foreground">（残 {man(r.keep)}）</span></td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/side-job-tax-return-200k" className="text-primary hover:underline">副業の確定申告は「20万円以下なら不要」は本当？</Link></li>
            <li><Link href="/blog/side-job-juminzei-shinkoku" className="text-primary hover:underline">副業の住民税はいくら増える？申告のやり方と「自分で納付」の選び方</Link></li>
            <li><Link href="/blog/freelance-nenmatsu-chosei" className="text-primary hover:underline">年末調整と確定申告の関係（会社員と兼業の場合）</Link></li>
            <li><Link href="/blog/freelance-expenses-list" className="text-primary hover:underline">経費にできるものの一覧</Link></li>
            <li><Link href="/tools/invoice" className="text-primary hover:underline">副業の請求書を作る（無料ツール）</Link></li>
          </ul>
          <ExcelUpsell item="tax" />
          <ToolFaq items={FAQS} />
          <MoreTools current="/tools/fukugyo" />
        </section>
      </main>
    </SiteShell>
  )
}
