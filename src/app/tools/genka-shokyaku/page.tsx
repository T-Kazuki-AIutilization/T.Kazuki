import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { ExcelUpsell } from '@/components/marketing/excel-upsell'
import { SITE_URL } from '@/lib/site'
import { options } from '@/lib/genka'
import { GenkaCalculator } from './calculator'

export const metadata: Metadata = {
  title: '減価償却の計算ツール｜パソコンは10万円以上でも経費にできる？少額減価償却資産 40万円未満に対応（無料）| FreelanceOS',
  description:
    'フリーランス・個人事業主向けの減価償却の計算ツール。パソコン・カメラ・車などの取得価額と使い始めた月から、今年の経費を「10 万円未満」「一括償却資産」「少額減価償却資産の特例（2026 年 4 月以後は 40 万円未満）」「通常の減価償却（定額法・定率法）」で比較。家事按分・年ごとの償却費の表つき。登録不要。',
  alternates: { canonical: '/tools/genka-shokyaku' },
  openGraph: { title: '減価償却の計算ツール（少額減価償却資産 40 万円未満に対応）| FreelanceOS', description: 'パソコンなどを買ったとき、今年いくら経費にできるかを方法別に比較。2026 年 4 月以後の取得は 40 万円未満まで一括で経費に（青色申告）。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-genka-shokyaku.png', width: 1200, height: 630 }] },
}

const yen = (n: number) => new Intl.NumberFormat('ja-JP').format(n)

const FAQS = [
  { q: 'パソコンは 10 万円以上だと一度に経費にできない？', a: '取得価額が 10 万円以上なら原則は減価償却で、パソコン（サーバー用を除く）は耐用年数 4 年にわたって経費にします。ただし青色申告なら「少額減価償却資産の特例」で、2026 年 4 月 1 日以後に取得したものは 40 万円未満まで、使い始めた年に全額を経費にできます（その年の合計 300 万円まで）。20 万円未満なら、白色申告でも一括償却資産として 3 年で 1/3 ずつ経費にできます。' },
  { q: '少額減価償却資産の特例が 40 万円未満になったのはいつから？', a: '令和 8 年度の税制改正で、2026 年 4 月 1 日以後に取得した資産から 40 万円未満になりました（3 月 31 日までの取得は 30 万円未満）。適用は 2029 年 3 月 31 日までに取得した資産です。青色申告をしている個人事業主が対象で、白色申告では使えません（国税庁タックスアンサー No.2100）。' },
  { q: '年末に買うと節税になる？', a: '経費になるのは「業務に使い始めた年」です。12 月に買っても使い始めるのが 1 月なら来年の経費です。通常の減価償却だと 12 月に使い始めた年は 1 か月分しか経費になりませんが、少額減価償却資産の特例なら全額、一括償却資産なら 1/3 を、12 月に使い始めた年でも経費にできます。ただし、税金が減る額は払った額より小さいので、必要のないものを買うと手元のお金は減ります。' },
  { q: 'プライベートでも使うパソコンは？', a: '事業で使う割合（家事按分）を掛けた額を経費にします。10 万円・20 万円・40 万円未満かどうかの判定は、割合を掛ける前の取得価額で行います。割合は使用時間などの合理的な基準で決め、根拠をメモしておきましょう。' },
  { q: '消費税は含めて判定する？', a: '経理方式によります。税込経理なら消費税込みの額、税抜経理なら消費税抜きの額で 10 万円・20 万円・40 万円未満を判定します。免税事業者は税込経理です（国税庁タックスアンサー No.2100）。' },
  { q: '中古のパソコンや車は？', a: '中古資産は、法定耐用年数ではなく、残りの使用可能期間の見積もりを耐用年数にできます。見積もりが難しければ簡便法で、法定耐用年数を全部過ぎたものは「法定耐用年数 × 20%」、一部を過ぎたものは「（法定耐用年数 − 経過年数）＋ 経過年数 × 20%」（1 年未満の端数は切り捨て、2 年未満なら 2 年）です。たとえば新車から 4 年以上たった中古の普通自動車（法定 6 年）は、6 年から 4 年を引いた 2 年に 4 年 × 20% の 0.8 年を足した 2.8 年の端数を切り捨てて 2 年です。' },
  { q: '確定申告ではどこに書く？', a: '青色申告決算書（3 ページ目）または収支内訳書（2 ページ目）の「減価償却費の計算」欄に、資産ごとに記入し、合計を損益計算書の減価償却費に入れます。少額減価償却資産の特例を使ったものは、摘要欄に特例を使った旨（措法 28 条の 2）を書きます。会計ソフトを使っていれば、固定資産の登録から自動で作られます。' },
]

const EXAMPLES = [80000, 150000, 250000, 350000]

export default function GenkaToolPage() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'FreelanceOS 減価償却の計算ツール', url: `${SITE_URL}/tools/genka-shokyaku`, applicationCategory: 'FinanceApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' }, inLanguage: 'ja' }
  const rows = EXAMPLES.map((price) => {
    const o = options({ cost: price, life: 4, method: 'teigaku', year: 2026, month: 12, ratio: 1, aoiro: true })
    const get = (id: string) => o.find((x) => x.id === id)?.first
    return { price, zengaku: get('zengaku'), shogaku: get('shogaku'), ikkatsu: get('ikkatsu'), normal: get('normal') }
  })
  const cell = (n?: number) => (n === undefined ? '—' : `¥${yen(n)}`)
  return (
    <SiteShell>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">減価償却の計算ツール（パソコン・カメラ・車） <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
          <p className="mt-2 text-sm text-muted-foreground">仕事用に買ったものの取得価額と使い始めた月から、今年いくら経費にできるかを、使える方法ごとに比較します。2026 年 4 月以後の取得は、青色申告なら 40 万円未満まで一度に経費にできます（少額減価償却資産の特例）。</p>
        </div>
        <GenkaCalculator />

        <section className="mt-12">
          <h2 className="text-lg font-bold">早見表: 取得価額と経費にする方法</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">取得価額</th><th className="pr-3">青色申告</th><th>白色申告</th></tr></thead>
              <tbody>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">10 万円未満</td><td className="pr-3" colSpan={2}>使い始めた年に全額経費（消耗品費など）</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">10 万円以上 20 万円未満</td><td className="pr-3">少額減価償却資産の特例で全額、一括償却資産（3 年で 1/3 ずつ）、通常の減価償却から選ぶ</td><td>一括償却資産（3 年で 1/3 ずつ）か通常の減価償却</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">20 万円以上 40 万円未満</td><td className="pr-3">少額減価償却資産の特例で全額（2026 年 3 月 31 日までの取得は 30 万円未満）か通常の減価償却</td><td>通常の減価償却</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">40 万円以上</td><td className="pr-3" colSpan={2}>通常の減価償却（耐用年数にわたって経費にする）</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">少額減価償却資産の特例は、2029 年 3 月 31 日までに取得した資産が対象で、その年の合計 300 万円まで。</p>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-bold">例: 2026 年 12 月にパソコンを買って使い始めた場合の 2026 年の経費</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3">取得価額</th><th className="pr-3 text-right">10 万円未満</th><th className="pr-3 text-right">少額減価償却資産の特例</th><th className="pr-3 text-right">一括償却資産</th><th className="text-right">通常の減価償却（定額法）</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.price} className="border-b border-slate-100">
                    <td className="py-1.5 pr-3">{yen(r.price)} 円</td>
                    <td className="pr-3 text-right tabular-nums">{cell(r.zengaku)}</td>
                    <td className="pr-3 text-right tabular-nums">{cell(r.shogaku)}</td>
                    <td className="pr-3 text-right tabular-nums">{cell(r.ikkatsu)}</td>
                    <td className="text-right tabular-nums">{cell(r.normal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">青色申告・事業専用（100%）・耐用年数 4 年。通常の減価償却は 12 月の 1 か月分。— はその方法が使えない価格帯。</p>
        </section>

        <section className="mt-12 text-sm leading-relaxed text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">あわせて読みたい</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><Link href="/blog/shogaku-genka-shokyaku-40man" className="text-primary hover:underline">少額減価償却資産の特例が 40 万円未満に（2026 年 4 月以後の取得）。償却資産税の申告と決算書の書き方</Link></li>
            <li><Link href="/blog/freelance-expenses-list" className="text-primary hover:underline">フリーランスの経費にできるもの一覧</Link></li>
            <li><Link href="/blog/freelance-year-end-checklist" className="text-primary hover:underline">フリーランスの年末にやることチェックリスト</Link></li>
            <li><Link href="/tools/anbun" className="text-primary hover:underline">家事按分の計算ツール</Link></li>
            <li><Link href="/tools/aoiro" className="text-primary hover:underline">青色申告の節税額シミュレーター</Link></li>
          </ul>
          <ExcelUpsell item="tax" />
          <ToolFaq items={FAQS} />
          <p className="mt-6 text-xs">前提: 国税庁タックスアンサー No.2100（減価償却のあらまし）・No.2106（定額法と定率法）と「減価償却資産の償却率等表」「主な減価償却資産の耐用年数表」。2007 年 4 月 1 日以後に取得した新品の資産について、定額法・200% 定率法で概算しています（償却費は 1 円未満切り捨て、有形の資産は 1 円まで、ソフトウエアは定額法で 0 円まで）。少額減価償却資産の特例は従業員数などの要件があり、中古資産の耐用年数、貸付用の資産、特別償却は含みません。節税額は「今年の経費 × 税率の目安」の概算で、個人事業税・国民健康保険料への影響は含みません。</p>
          <MoreTools current="/tools/genka-shokyaku" />
        </section>
      </main>
    </SiteShell>
  )
}
