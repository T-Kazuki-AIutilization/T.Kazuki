import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { ExcelUpsell } from '@/components/marketing/excel-upsell'
import { AffiliateBox, AdNotice } from '@/components/marketing/affiliate-box'
import { SITE_URL } from '@/lib/site'
import { KakuteiChecklist } from './checklist'

export const metadata: Metadata = {
  title: '確定申告の準備チェックリスト（フリーランス・個人事業主向け・2026年分）｜やることと期限を順番に | FreelanceOS',
  description:
    'フリーランス・個人事業主の確定申告（2026 年分、2027 年 2 月 16 日〜3 月 15 日）に向けて、事前準備・書類集め・帳簿の締め・申告書の作成・提出と納税までの 32 項目をチェックできる無料ツール。進み具合は端末に保存。',
  alternates: { canonical: '/tools/kakutei-checklist' },
  openGraph: { title: '確定申告の準備チェックリスト（無料）| FreelanceOS', description: 'やることと期限を 32 項目でチェック。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-kakutei-checklist.png', width: 1200, height: 630 }] },
}

const IDS = ['mf-kakutei', 'yayoi-aoiro', 'freee-kaikei']
const FAQS = [
  { q: '2026 年分の確定申告はいつ？', a: '2027 年 2 月 16 日（火）から 3 月 15 日（月）までです。所得税の納付期限も 3 月 15 日で、振替納税を選ぶと引き落としは 4 月中旬になります。消費税の申告・納付期限は 3 月 31 日です。還付だけになる申告は 1 月 1 日から出せます。' },
  { q: '何から始めればいい？', a: 'まず 12 月末までの売上と経費を帳簿にすべて入力し、控除証明書（国民年金・生命保険・iDeCo など）と領収書をそろえます。帳簿が締まれば、申告書の作成は会計ソフトや確定申告書等作成コーナーで 1〜2 日で終わります。' },
  { q: 'チェックした内容はどこに保存される？', a: 'お使いのブラウザ（端末）の中にだけ保存されます。サーバーには送られません。別の端末やブラウザでは引き継がれないので、同じ端末で開いてください。' },
]

export default function KakuteiChecklistPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FreelanceOS 確定申告の準備チェックリスト', url: `${SITE_URL}/tools/kakutei-checklist`, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' }, inLanguage: 'ja' }
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <h1 className="text-2xl font-bold sm:text-3xl">確定申告の準備チェックリスト <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
        <AdNotice ids={IDS} />
        <p className="mt-2 text-sm text-muted-foreground">フリーランス・個人事業主の 2026 年分の確定申告（2027 年 2 月 16 日〜3 月 15 日）に向けて、やることを時期順に 32 項目にまとめました。終わったものにチェックを入れると、進み具合が表示されます。</p>
        <div className="mt-6"><KakuteiChecklist /></div>
        <AffiliateBox title="帳簿づけから申告書の作成・e-Tax 提出までまとめるなら" ids={IDS} className="mt-10" />
        <ExcelUpsell item="tax" />
        <section className="mt-10 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/freelance-tax-prep" className="text-primary hover:underline">確定申告の準備と帳簿のつけ方</Link></li>
            <li><Link href="/blog/freelance-etax-how-to" className="text-primary hover:underline">初めての e-Tax 確定申告の手順</Link></li>
            <li><Link href="/blog/freelance-kakutei-shinkoku-ikurakara" className="text-primary hover:underline">確定申告はいくらから必要？</Link></li>
          </ul>
          <ToolFaq items={FAQS} />
          <MoreTools current="/tools/kakutei-checklist" />
        </section>
      </main>
    </SiteShell>
  )
}
