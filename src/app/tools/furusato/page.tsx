import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { FurusatoCalculator } from './calculator'
import { TAKEHOME_AMOUNTS } from '@/lib/takehome'
import { SITE_URL } from '@/lib/site'
import { ToolFaq } from '@/components/marketing/tool-faq'

export const metadata: Metadata = {
  title: 'ふるさと納税の上限額シミュレーター（フリーランス・個人事業主向け・無料）| FreelanceOS',
  description:
    'フリーランス・個人事業主のふるさと納税の控除上限額（自己負担 2,000 円で済む寄附額）を、売上・経費・青色申告特別控除から概算。国民年金・国保の社会保険料控除も自動で反映。2026 年分対応、登録不要。',
  alternates: { canonical: '/tools/furusato' },
  openGraph: { title: 'ふるさと納税の上限額シミュレーター（フリーランス向け・無料）| FreelanceOS', description: '売上と経費からふるさと納税の上限額を概算。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-furusato.png', width: 1200, height: 630 }] },
}

const FAQS = [
  { q: 'フリーランスもワンストップ特例を使える？', a: '使えません。ワンストップ特例は確定申告をしない人向けの制度で、申請していても確定申告をすると無効になります。フリーランス・個人事業主は、確定申告書の寄附金控除の欄に寄附額を記入し、自治体から届く受領証明書（またはポータルサイトの寄附金控除に関する証明書）をもとに申告します。' },
  { q: '上限額はいつの所得で決まる？', a: '1 月から 12 月までの寄附は、同じ年の所得で判定されます。2026 年中の寄附なら 2026 年分の所得です。所得税は確定申告で還付・減額され、住民税は翌年度（2027 年 6 月から）の税額が減ります。売上が年末まで確定しないフリーランスは、12 月に売上の見込みを確認してから寄附すると安全です。' },
  { q: '上限を超えて寄附するとどうなる？', a: '罰則はありませんが、上限を超えた分は控除されず、自己負担が 2,000 円より増えます。概算で計算した上限ぎりぎりではなく、目安の 9 割程度にとどめるのがおすすめです。' },
  { q: 'iDeCo や小規模企業共済に入ると上限は変わる？', a: '掛金は全額が所得控除になるため、課税所得が下がり、ふるさと納税の上限も下がります。ただし、所得控除による節税額のほうが大きいので、掛金を減らしてまで上限を上げる必要はありません。「その他の所得控除」に掛金を入れて試算してください。' },
  { q: '計算式は？', a: '住民税の特例控除は「住民税所得割額の 20%」が上限なので、上限額は「住民税所得割額 × 20% ÷（90% − 所得税の税率 × 1.021）＋ 2,000 円」で求めます。所得税の税率は、住民税の課税所得から人的控除の差（基礎控除分 5 万円）を引いた額で判定します。' },
  { q: '2027 年から上限が変わると聞いた', a: '令和 8 年度税制改正で、住民税の特例控除額に 193 万円の上限が設けられます（2027 年の寄附分から）。給与収入 1 億円相当の人が対象になる水準で、一般的なフリーランスの上限額には影響しません。' },
]

export default function FurusatoToolPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FreelanceOS ふるさと納税 上限額シミュレーター', url: `${SITE_URL}/tools/furusato`, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' }, inLanguage: 'ja' }
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">ふるさと納税の上限額シミュレーター（フリーランス向け） <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">会社員向けの早見表は「給与収入」で作られているため、フリーランスにはそのまま使えません。売上・経費・青色申告特別控除から、自己負担 2,000 円で済む寄附額の上限を概算します。国民年金・国民健康保険の社会保険料控除も自動で反映します。</p>
        </div>
        <FurusatoCalculator />
        <section className="mt-12 text-sm">
          <h2 className="text-base font-semibold">売上別の上限の目安（経費率 20%・青色申告・独身）</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {TAKEHOME_AMOUNTS.map((x) => (
              <li key={x}><Link href={`/tools/furusato/${x}`} className="inline-block rounded border px-2 py-1 text-xs hover:bg-slate-50">売上 {x.toLocaleString('ja-JP')}万円</Link></li>
            ))}
          </ul>
        </section>
        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/freelance-furusato-nozei" className="text-primary hover:underline">フリーランス・個人事業主のふるさと納税（上限額の計算方法と確定申告の書き方）</Link></li>
            <li><Link href="/blog/freelance-year-end-checklist" className="text-primary hover:underline">フリーランスが年内にやることチェックリスト</Link></li>
            <li><Link href="/blog/freelance-tax-prep" className="text-primary hover:underline">確定申告の準備（必要書類と控除）</Link></li>
            <li><Link href="/tools/takehome" className="text-primary hover:underline">手取り計算シミュレーター（無料）</Link></li>
          </ul>
          <ToolFaq items={FAQS} />
        </section>
      </main>
    </SiteShell>
  )
}
