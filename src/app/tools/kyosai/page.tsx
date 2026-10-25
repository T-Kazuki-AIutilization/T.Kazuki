import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { SITE_URL } from '@/lib/site'
import { KyosaiCalculator } from './calculator'

export const metadata: Metadata = {
  title: 'iDeCo・小規模企業共済の節税額シミュレーター（フリーランス・個人事業主向け・無料）| FreelanceOS',
  description:
    'フリーランス・個人事業主が iDeCo と小規模企業共済に掛金を払うと、所得税・住民税がいくら下がるかを売上・経費から計算。掛金の上限、年末の前納、国保が下がらない理由などの注意点つき。2026 年分、登録不要。',
  alternates: { canonical: '/tools/kyosai' },
  openGraph: { title: 'iDeCo・小規模企業共済の節税額シミュレーター（無料）| FreelanceOS', description: '掛金で下がる所得税・住民税を計算。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-kyosai.png', width: 1200, height: 630 }] },
}

const FAQS = [
  { q: 'iDeCo と小規模企業共済の違いは？', a: 'iDeCo は老後資金のための年金制度で、原則 60 歳まで引き出せません。小規模企業共済は個人事業主の退職金のための制度で、廃業時や 65 歳以上で受け取れ、掛金の範囲内で貸付も受けられます。どちらも掛金の全額が所得控除になります。' },
  { q: '掛金の上限は？', a: '自営業者（国民年金の第 1 号被保険者）の iDeCo は、国民年金基金や付加保険料と合わせて月 68,000 円まで（2026 年時点）。小規模企業共済は月 1,000〜70,000 円の範囲で 500 円単位で選べます。' },
  { q: '年末にまとめて払っても今年の控除になる？', a: '小規模企業共済は、1 年分以内の掛金を前納でき、12 月中に払えばその年の控除になります（前納減額金もあります）。iDeCo は原則として毎月の拠出で、年単位でまとめて拠出する方法もありますが、手続きと時期が決まっているため加入先で確認してください。' },
  { q: '国民健康保険料も下がる？', a: '下がりません。国保料は「所得 − 43 万円」をもとに計算され、iDeCo や共済などの所得控除は差し引かれないためです。下がるのは所得税と住民税です。' },
  { q: '注意点は？', a: 'iDeCo は 60 歳まで引き出せず、小規模企業共済は加入期間が短いうちに任意で解約すると元本割れすることがあります。節税額だけで決めず、手元資金に余裕を残せる掛金にしましょう。' },
]

export default function KyosaiToolPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FreelanceOS iDeCo・小規模企業共済の節税額シミュレーター', url: `${SITE_URL}/tools/kyosai`, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' }, inLanguage: 'ja' }
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">iDeCo・小規模企業共済の節税額シミュレーター <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">フリーランス・個人事業主が iDeCo と小規模企業共済に掛金を払うと、所得税と住民税がいくら下がるかを計算します（2026 年分）。</p>
        </div>
        <KyosaiCalculator />
        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/freelance-year-end-checklist" className="text-primary hover:underline">フリーランスが年内にやることチェックリスト（共済の前納など）</Link></li>
            <li><Link href="/tools/furusato" className="text-primary hover:underline">ふるさと納税の上限額（掛金を入れると上限が変わる）</Link></li>
            <li><Link href="/tools/takehome" className="text-primary hover:underline">手取り計算シミュレーター</Link></li>
          </ul>
          <ToolFaq items={FAQS} />
          <MoreTools current="/tools/kyosai" />
        </section>
      </main>
    </SiteShell>
  )
}
