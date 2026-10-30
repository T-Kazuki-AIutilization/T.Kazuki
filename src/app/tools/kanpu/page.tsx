import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { ExcelUpsell } from '@/components/marketing/excel-upsell'
import { SITE_URL } from '@/lib/site'
import { calcKanpu, withheldOf } from '@/lib/kanpu'
import { calc as takehome } from '@/lib/takehome'
import { KanpuCalculator } from './calculator'

export const metadata: Metadata = {
  title: '確定申告の還付金の計算ツール（フリーランス・源泉徴収 10.21%）｜いくら戻る？2026 年分（無料）| FreelanceOS',
  description:
    'フリーランス・個人事業主が確定申告で戻る所得税（還付金）を、売上・経費・青色申告特別控除・社会保険料・源泉徴収税額から計算。申告書第一表と同じ流れの内訳、売上別の還付の目安の表、還付の時期つき。2026 年分の基礎控除に対応。登録不要。',
  alternates: { canonical: '/tools/kanpu' },
  openGraph: { title: '確定申告の還付金の計算ツール（フリーランス）| FreelanceOS', description: '源泉徴収された 10.21% のうち、確定申告でいくら戻るかを計算。2026 年分の基礎控除に対応。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-kanpu.png', width: 1200, height: 630 }] },
}

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(n)

const FAQS = [
  { q: 'フリーランスの確定申告で還付されるのはなぜ？', a: '原稿料・デザイン料・講師料などの報酬からは、所得税の前払いとして 10.21% が源泉徴収されます。この額は売上に対してかかるため、経費・青色申告特別控除・基礎控除・社会保険料を引いて計算した 1 年分の所得税より多くなりやすく、確定申告で差額が戻ります。' },
  { q: '還付金はいつ振り込まれる？', a: '還付になる申告は翌年 1 月 1 日から提出でき、e-Tax なら 3 週間程度、書面なら 1 か月〜1 か月半で、申告書に書いた本人名義の口座に振り込まれます。2026 年分は 2027 年 1 月から提出できます。' },
  { q: '支払調書が届かないと申告できない？', a: '支払調書はクライアントが税務署に出す書類で、本人へ送る義務はありません。申告書に添付する必要もないので、請求書や入金の記録から源泉徴収税額の合計を自分で集計して申告できます。' },
  { q: '源泉徴収税額はどう集計する？', a: '源泉徴収された報酬ごとに、税抜の報酬額 × 10.21%（1 回の支払いが 100 万円を超える部分は 20.42%）を足します。振込額から逆算するときは、振込手数料を差し引かれていないかも確認します。' },
  { q: '住民税や国民健康保険料も戻る？', a: '源泉徴収されるのは所得税だけなので、確定申告で戻るのも所得税です。住民税と国民健康保険料は、確定申告の所得をもとに翌年 6 月ごろから請求されます。' },
  { q: '申告し忘れた年の分も戻る？', a: '還付を受けるための申告は、その年の翌年 1 月 1 日から 5 年間できます。2021 年分は 2026 年 12 月 31 日までです。' },
]

const SALES = [2000000, 3000000, 5000000, 8000000]

export default function KanpuToolPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FreelanceOS 確定申告の還付金の計算ツール', url: `${SITE_URL}/tools/kanpu`, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' }, inLanguage: 'ja' }
  const rows = SALES.map((sales) => {
    const expenses = Math.round(sales * 0.2)
    const social = (aoiro: number) => takehome({ sales, expenses, aoiro, other: 0, withheld: 0, taxable: false, bizRate: 0, nhiRate: 0.1 }).social
    const withheld = withheldOf(sales)
    const aoiro = calcKanpu({ sales, expenses, aoiro: 650000, social: social(650000), other: 0, withheld, yotei: 0 })
    const shiro = calcKanpu({ sales, expenses, aoiro: 0, social: social(0), other: 0, withheld, yotei: 0 })
    return { sales, withheld, aoiro: -aoiro.settle, shiro: -shiro.settle }
  })
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">確定申告の還付金の計算ツール（フリーランス） <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">報酬から源泉徴収された 10.21% のうち、確定申告でいくら戻るか（または納めるか）を、2026 年分の基礎控除で計算します。申告書第一表と同じ流れの内訳も表示します。</p>
        </div>
        <KanpuCalculator />

        <section className="mt-12">
          <h2 className="text-lg font-bold">早見表: 売上別の還付の目安（2026 年分）</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">売上（税抜）</th><th className="pr-3 text-right">源泉徴収税額</th><th className="pr-3 text-right">還付（青色 65 万円）</th><th className="text-right">還付（白色）</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.sales} className="border-b border-slate-100">
                    <td className="py-1.5 pr-3">{yen(r.sales / 10000)} 万円</td>
                    <td className="pr-3 text-right tabular-nums">¥{yen(r.withheld)}</td>
                    <td className="pr-3 text-right tabular-nums">{r.aoiro > 0 ? `¥${yen(r.aoiro)}` : `納付 ¥${yen(-r.aoiro)}`}</td>
                    <td className="text-right tabular-nums">{r.shiro > 0 ? `¥${yen(r.shiro)}` : `納付 ¥${yen(-r.shiro)}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">売上の全額が源泉徴収の対象（1 回 100 万円以下）、経費は売上の 20%、単身で所得控除は社会保険料（国民年金と国民健康保険料の概算・所得割 10%）と基礎控除だけの場合。ほかの所得控除があれば還付は増えます。</p>
        </section>

        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/freelance-withholding-tax" className="text-primary hover:underline">フリーランスの源泉徴収とは？対象になる報酬・10.21% の計算方法・確定申告での還付まで</Link></li>
            <li><Link href="/blog/freelance-etax-how-to" className="text-primary hover:underline">フリーランスの確定申告のやり方【初めての e-Tax】必要なもの・作成コーナーの手順・提出後の流れ</Link></li>
            <li><Link href="/blog/freelance-shotoku-koujo-ichiran" className="text-primary hover:underline">フリーランス・個人事業主が使える所得控除一覧。節税額の目安と、確定申告で必要な証明書</Link></li>
            <li><Link href="/tools/withholding" className="text-primary hover:underline">源泉徴収税額の計算ツール（報酬ごとの 10.21%）</Link></li>
            <li><Link href="/tools/aoiro" className="text-primary hover:underline">青色申告の節税額シミュレーター</Link></li>
          </ul>
          <ExcelUpsell item="tax" />
          <ToolFaq items={FAQS} />
          <p className="mt-6 text-xs">前提: 2026 年分の所得税（基礎控除は本則 62 万円＋合計所得 489 万円以下 42 万円・655 万円以下 5 万円の特例加算、所得税の速算表、復興特別所得税 2.1%）。申告書第一表の流れで、課税される所得金額は 1,000 円未満、申告納税額は黒字の場合に 100 円未満を切り捨てています。事業所得だけの単身の場合で、給与などほかの所得、税額控除（住宅ローン控除など）、損失の繰越し、変動所得の平均課税は含みません。</p>
          <MoreTools current="/tools/kanpu" />
        </section>
      </main>
    </SiteShell>
  )
}
