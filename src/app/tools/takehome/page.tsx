import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { TakeHomeCalculator } from './calculator'
import { TAKEHOME_AMOUNTS, MONTHLY_AMOUNTS } from '@/lib/takehome'
import { SITE_URL } from '@/lib/site'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'

export const metadata: Metadata = {
  title: 'フリーランス・個人事業主の手取り計算シミュレーター（無料）｜売上と経費から所得税・住民税・国保・年金を一括計算【2026年分】 | FreelanceOS',
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

const FAQS = [
  { q: '売上 500 万円のフリーランスの手取りはいくら？', a: '経費 60 万円、青色申告 65 万円控除、国保の所得割率 10% の条件では、年間の手取りは約 340 万円（売上の約 68%）です。税金・保険料の合計は約 100 万円で、内訳は所得税 約 11.5 万円、住民税 約 27 万円、国保 約 39 万円、国民年金 約 22 万円です。' },
  { q: '会社員の年収と比べるには？', a: '会社員の手取りは額面の 75〜80% が目安ですが、フリーランスは国保と国民年金を全額自己負担し、退職金や有給もありません。同じ手取りを得るには、会社員の額面年収の 1.3〜1.5 倍程度の売上が必要になることが多いです。' },
  { q: '国民健康保険の計算が自治体の試算と違う', a: '国保の所得割率と均等割は市区町村ごとに大きく異なります。このツールは所得割率を 9〜13% から選べ、均等割は 1 人 6 万円で概算しています。正確な額はお住まいの自治体の試算ページで確認してください。' },
  { q: '配偶者や扶養家族がいる場合は？', a: 'このツールは配偶者控除・扶養控除と国保の家族分を含みません。扶養家族がいる場合、所得税・住民税は少し下がり、国保は人数分の均等割が増えます。家族構成まで反映したい場合は Excel 版のパラメータを編集して試算してください。' },
  { q: '源泉徴収された分は手取りに含まれる？', a: '源泉徴収は所得税の前払いなので、手取りの計算には影響しません。「源泉徴収された所得税」を入力すると、確定申告で納付になるか還付になるかの目安を表示します。' },
]

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
        <section className="mt-12 text-sm">
          <h2 className="text-base font-semibold">売上別の手取りと内訳（経費率 20%・青色申告・独身）</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {TAKEHOME_AMOUNTS.map((x) => (
              <li key={x}><Link href={`/tools/takehome/${x}`} className="inline-block rounded border px-2 py-1 text-xs hover:bg-slate-50">売上 {x.toLocaleString('ja-JP')}万円</Link></li>
            ))}
          </ul>
        </section>
        <section className="mt-8 text-sm">
          <h2 className="text-base font-semibold">月単価別の手取り（フリーランスエンジニアなど・経費率 10%）</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {MONTHLY_AMOUNTS.map((x) => (
              <li key={x}><Link href={`/tools/takehome/monthly/${x}`} className="inline-block rounded border px-2 py-1 text-xs hover:bg-slate-50">月単価 {x}万円</Link></li>
            ))}
          </ul>
        </section>
        <section className="mt-12 text-sm leading-relaxed">
          <h2 className="text-base font-semibold">フリーランスの手取りの計算方法（売上 600 万円の例）</h2>
          <p className="mt-2 text-muted-foreground">経費 120 万円、青色申告特別控除 65 万円、独身・扶養なしの場合です。このツールは同じ手順で計算しています。</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li><span className="font-medium">事業所得</span>: 売上 600 万円 − 経費 120 万円 − 青色申告特別控除 65 万円 ＝ 415 万円</li>
            <li><span className="font-medium">社会保険料</span>: 国民年金 21.5 万円（月 17,920 円 × 12）＋ 国民健康保険 43.2 万円（（415 万円 − 43 万円）× 10% ＋ 均等割 6 万円）＝ 64.7 万円</li>
            <li><span className="font-medium">所得税</span>: 課税所得 ＝ 415 万円 − 64.7 万円 − 基礎控除 68 万円 ≒ 282.2 万円 → 税率 10%（控除額 97,500 円）＋ 復興特別所得税 2.1% で 約 18.9 万円</li>
            <li><span className="font-medium">住民税</span>: 課税所得 ＝ 415 万円 − 64.7 万円 − 基礎控除 43 万円 ≒ 307.2 万円 → 10% − 調整控除 ＋ 均等割 5,000 円 で 約 31 万円（翌年 6 月から納付）</li>
            <li><span className="font-medium">手取り</span>: 600 万円 − 経費 120 万円 − 社会保険料 64.7 万円 − 所得税 18.9 万円 − 住民税 31 万円 ≒ <span className="font-semibold">365.5 万円</span>（月 約 30.5 万円）</li>
          </ol>
          <p className="mt-3 text-muted-foreground">青色申告特別控除は経費ではないので、手取りの計算では売上から引きません（税金と国保を減らす効果だけがあります）。インボイス登録している場合は、さらに消費税の納税が加わります。</p>
        </section>
        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">計算の前提</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>所得税は速算表（5〜45%）と復興特別所得税 2.1%。基礎控除は 2026 年度改正後の 2026 年分の額（合計所得 489 万円以下 104 万円、〜655 万円 67 万円、それ以上 62 万円）を反映。</li>
            <li>住民税は所得割 10% ＋ 均等割 5,000 円（森林環境税込み）、基礎控除 43 万円、調整控除 2,500 円。翌年 6 月からの納付分を当年の負担として表示。</li>
            <li>国民健康保険は（所得 − 43 万円）× 所得割率 ＋ 均等割 6 万円（1 人分）で概算、年間上限 109 万円。自治体で大きく異なるため、正確な額は自治体の試算ページで確認してください。</li>
            <li>国民年金は 2026 年度の月額 17,920 円 × 12 か月。前納割引や免除は考慮しません。</li>
            <li>個人事業税は（青色控除前の所得 − 事業主控除 290 万円）× 税率。消費税は、インボイス登録した個人の 2 割特例（2026 年分まで、売上の消費税 × 20%）・3 割特例（2027・2028 年分、× 30%）、またはサービス業の簡易課税（× 50%）から選んで概算。本則課税は対象外。</li>
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
          <ToolFaq items={FAQS} />
          <MoreTools current="/tools/takehome" />
        </section>
      </main>
    </SiteShell>
  )
}
