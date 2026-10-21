import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { NhiCalculator } from './calculator'
import { NHI_AMOUNTS } from '@/lib/nhi'
import { SITE_URL } from '@/lib/site'
import { ToolFaq } from '@/components/marketing/tool-faq'

export const metadata: Metadata = {
  title: '国民健康保険料の計算ツール（無料・登録不要）｜フリーランス・個人事業主向け、自治体の料率で試算 | FreelanceOS',
  description:
    'フリーランス・個人事業主の国民健康保険料を、所得と世帯人数から概算。医療分・後期高齢者支援金分・介護分の所得割・均等割・平等割と上限を、お住まいの自治体の料率に変更して計算できます。登録不要、入力は端末内にのみ保存。',
  alternates: { canonical: '/tools/nhi' },
  openGraph: { title: '国民健康保険料の計算ツール（無料）| FreelanceOS', description: '所得と世帯人数から国保料を概算。自治体の料率に変更可能。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-nhi.png', width: 1200, height: 630 }] },
}

const FAQS = [
  { q: '国民健康保険料はどう計算される？', a: '多くの自治体では、医療分・後期高齢者支援金分・介護分（40〜64 歳）のそれぞれについて「所得割（基準所得 × 料率）＋ 均等割（加入者数 × 定額）＋ 平等割（1 世帯あたり定額、ない自治体も多い）」を計算し、区分ごとの上限を超えた分を切り捨てて合計します。基準所得は前年の所得から 43 万円を引いた額です。' },
  { q: 'いつの所得で決まる？', a: '前年 1〜12 月の所得をもとに、6〜7 月ごろにその年度（4 月〜翌 3 月）の保険料が決まります。独立 1 年目は会社員時代の所得で計算されるため、高く感じることが多いです。' },
  { q: '所得が少ない場合の軽減は？', a: '世帯の所得が基準以下なら、均等割と平等割が 7 割・5 割・2 割軽減されます。確定申告（所得がなくても申告）をしていないと判定できず軽減されないため、売上が少ない年も申告しておくことが大切です。このツールは軽減を含みません。' },
  { q: '会社を辞めた直後は任意継続とどちらが安い？', a: '任意継続は退職時の標準報酬月額をもとに最長 2 年間、保険料の全額（会社負担分を含む）を払います。上限があるため、前年の所得が高い人は任意継続のほうが安くなることがあります。このツールの結果と、加入していた健康保険組合の任意継続の保険料を比べて選んでください。' },
  { q: '払った保険料は経費になる？', a: '経費ではなく、確定申告の社会保険料控除として全額が所得から差し引かれます。家族の分を世帯主が払った場合も、払った人の控除にできます。' },
]

export default function NhiToolPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FreelanceOS 国民健康保険料の計算ツール', url: `${SITE_URL}/tools/nhi`, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' }, inLanguage: 'ja' }
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">国民健康保険料の計算ツール <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">所得と世帯の加入者数から、フリーランス・個人事業主の国民健康保険料を概算します。料率は自治体ごとに違うため、お住まいの市区町村の値に変更して計算できます。</p>
        </div>
        <NhiCalculator />
        <section className="mt-12 text-sm">
          <h2 className="text-base font-semibold">所得別の国民健康保険料の目安（世帯別）</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {NHI_AMOUNTS.map((x) => (
              <li key={x}><Link href={`/tools/nhi/${x}`} className="inline-block rounded border px-2 py-1 text-xs hover:bg-slate-50">所得 {x.toLocaleString('ja-JP')}万円</Link></li>
            ))}
          </ul>
        </section>
        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/freelance-health-insurance-pension" className="text-primary hover:underline">フリーランスの国民健康保険と国民年金はいくら？所得別の目安・負担を抑える方法</Link></li>
            <li><Link href="/blog/freelance-tax-calendar" className="text-primary hover:underline">税金・納付スケジュール年間カレンダー</Link></li>
            <li><Link href="/tools/takehome" className="text-primary hover:underline">手取り計算シミュレーター（無料ツール）</Link></li>
          </ul>
          <ToolFaq items={FAQS} />
        </section>
      </main>
    </SiteShell>
  )
}
