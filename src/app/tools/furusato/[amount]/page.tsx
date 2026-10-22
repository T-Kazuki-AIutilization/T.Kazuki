import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { SITE_URL } from '@/lib/site'
import { furusatoLimit, TAKEHOME_AMOUNTS as AMOUNTS, type FurusatoInputs } from '@/lib/takehome'

// 売上別のふるさと納税上限ページ。数値は上限額シミュレーターと同じ計算式でビルド時に算出する。
export const dynamicParams = false

const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })
const yen = (n: number) => n.toLocaleString('ja-JP')
const base = (sales: number, o: Partial<FurusatoInputs> = {}): FurusatoInputs => ({ sales, expenses: Math.round(sales * 0.2), aoiro: 650000, other: 0, nhiRate: 0.1, ...o })

function figures(amount: number) {
  const sales = amount * 10000
  const r = furusatoLimit(base(sales))
  const byExpense = [0.1, 0.2, 0.3, 0.4].map((e) => ({ e, r: furusatoLimit(base(sales, { expenses: Math.round(sales * e) })) }))
  const byDeduction = [
    { k: '控除なし（基本）', r },
    { k: 'iDeCo 満額（年 81.6 万円）', r: furusatoLimit(base(sales, { other: 816000 })) },
    { k: 'iDeCo ＋ 小規模企業共済 満額（年 165.6 万円）', r: furusatoLimit(base(sales, { other: 1656000 })) },
    { k: '青色申告 10 万円控除（簡易簿記）', r: furusatoLimit(base(sales, { aoiro: 100000 })) },
  ]
  return { sales, r, byExpense, byDeduction }
}

export function generateStaticParams() {
  return AMOUNTS.map((a) => ({ amount: String(a) }))
}

export function generateMetadata({ params }: { params: { amount: string } }): Metadata {
  const a = Number(params.amount)
  if (!AMOUNTS.includes(a)) return {}
  const { r } = figures(a)
  const title = `売上${a.toLocaleString('ja-JP')}万円の個人事業主・フリーランスのふるさと納税の上限は約${man(r.limit)}万円【2026年分】| FreelanceOS`
  const description = `売上 ${a.toLocaleString('ja-JP')} 万円の個人事業主・フリーランスがふるさと納税で自己負担 2,000 円に収まる寄附額の上限は約 ${man(r.limit)} 万円（経費率 20%・青色申告 65 万円・独身）。経費率別、iDeCo・小規模企業共済に入っている場合の上限と、確定申告での注意点。`
  return {
    title,
    description,
    alternates: { canonical: `/tools/furusato/${a}` },
    openGraph: { title, description, type: 'article', locale: 'ja_JP', images: [{ url: '/blog/og/tools-furusato.png', width: 1200, height: 630 }] },
  }
}

export default function FurusatoAmountPage({ params }: { params: { amount: string } }) {
  const a = Number(params.amount)
  if (!AMOUNTS.includes(a)) notFound()
  const { sales, r, byExpense, byDeduction } = figures(a)
  const label = `${a.toLocaleString('ja-JP')}万円`
  const idx = AMOUNTS.indexOf(a)
  const prev = AMOUNTS[idx - 1]
  const next = AMOUNTS[idx + 1]
  const faqs = [
    { q: `売上${label}の個人事業主のふるさと納税の上限はいくら？`, a: `経費が売上の 20%、青色申告特別控除 65 万円、独身・扶養なしの場合、自己負担 2,000 円に収まる上限の目安は約 ${yen(r.limit)} 円です。売上が年末まで確定しないため、目安の 9 割（約 ${yen(Math.floor((r.limit * 0.9) / 1000) * 1000)} 円）程度までにしておくと安全です。` },
    { q: '個人事業主はワンストップ特例を使える？', a: '使えません。確定申告をする人はワンストップ特例の対象外で、申請していても確定申告をすると無効になります。寄附はすべて確定申告書の寄附金控除に記入し、第二表の住民税に関する事項（都道府県、市区町村分）にも寄附額を書きます。' },
    { q: '会社員の早見表と違うのはなぜ？', a: `会社員の早見表は給与収入から給与所得控除を引いて計算されています。個人事業主は売上から経費・青色申告特別控除を引き、さらに国民健康保険（この例で約 ${man(r.nhi)} 万円）と国民年金（約 ${man(r.pension)} 万円）を社会保険料控除として引いた所得で決まるため、売上を早見表の年収欄に当てはめても正しい上限になりません。` },
  ]
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="text-xs text-muted-foreground"><Link href="/tools" className="hover:underline">無料ツール</Link> › <Link href="/tools/furusato" className="hover:underline">ふるさと納税の上限額</Link> › 売上{label}</nav>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">売上{label}の個人事業主・フリーランスのふるさと納税の上限は？【2026年分】</h1>
        <div className="mt-6 rounded-xl border bg-white p-5">
          <p className="text-sm text-muted-foreground">売上 {label}・経費率 20%・青色申告 65 万円・独身の場合</p>
          <p className="mt-1 text-4xl font-bold">約 {yen(r.limit)} 円</p>
          <p className="mt-1 text-sm text-muted-foreground">自己負担 2,000 円に収まる寄附額の上限（目安）。安全に寄附するなら 9 割の約 {yen(Math.floor((r.limit * 0.9) / 1000) * 1000)} 円まで。</p>
        </div>

        <h2 className="mt-10 text-xl font-bold">計算の内訳</h2>
        <table className="mt-3 w-full text-sm">
          <tbody>
            <Row k="売上" v={`${man(sales)} 万円`} />
            <Row k="経費（売上の 20%）・青色申告特別控除 65 万円を引いた事業所得" v={`${man(r.income)} 万円`} />
            <Row k="社会保険料控除（国民年金＋国保の概算）" v={`−${man(r.social)} 万円`} />
            <Row k="住民税の課税所得（基礎控除 43 万円を引いた後）" v={`${man(r.taxableRes)} 万円`} />
            <Row k="住民税の所得割額" v={`${yen(r.shotokuwari)} 円`} />
            <Row k="所得税の税率（判定用）" v={`${Math.round(r.rate * 100)}%`} />
            <Row k="上限 ＝ 所得割 × 20% ÷（90% − 税率 × 1.021）＋ 2,000 円" v={`${yen(r.limit)} 円`} bold />
          </tbody>
        </table>

        <h2 className="mt-10 text-xl font-bold">経費率別の上限（売上 {label}）</h2>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">経費率</th><th>経費</th><th>事業所得</th><th>上限の目安</th></tr></thead>
            <tbody>
              {byExpense.map(({ e, r: x }) => (
                <tr key={e} className="border-b border-slate-100">
                  <td className="py-1.5">{Math.round(e * 100)}%</td>
                  <td className="tabular-nums">{man(sales * e)} 万円</td>
                  <td className="tabular-nums">{man(x.income)} 万円</td>
                  <td className="tabular-nums font-semibold">{yen(x.limit)} 円</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl font-bold">iDeCo・小規模企業共済・青色申告の影響（経費率 20%）</h2>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">条件</th><th>上限の目安</th></tr></thead>
            <tbody>
              {byDeduction.map(({ k, r: x }) => (
                <tr key={k} className="border-b border-slate-100"><td className="py-1.5">{k}</td><td className="tabular-nums font-semibold">{yen(x.limit)} 円</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">所得控除が増えると課税所得が下がるため、ふるさと納税の上限も下がります。ただし iDeCo や共済の節税額のほうが大きいので、上限を上げるために掛金を減らす必要はありません。</p>

        <h2 className="mt-10 text-xl font-bold">個人事業主が気をつけること</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
          <li>ワンストップ特例は使えないため、寄附はすべて確定申告に書く。</li>
          <li>今年分になるのは 12 月 31 日までに決済された寄附。12 月に売上と経費の見込みを確認してから寄附する。</li>
          <li>独立した年は、退職前の給与も合わせて計算する（給与があると上限は大きくなる）。</li>
          <li>配偶者・扶養控除、医療費控除、住宅ローン控除がある人は上限が変わる（住宅ローン控除は上限が下がることがある）。</li>
        </ul>

        <div className="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm">
          <p className="font-semibold">自分の数字で計算する</p>
          <p className="mt-1 text-muted-foreground">上限額シミュレーター（無料・登録不要）で、売上・経費・控除を変えて計算できます。</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/tools/furusato" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">上限額シミュレーターを開く</Link>
            <Link href={`/tools/takehome/${a}`} className="inline-flex h-9 items-center rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary hover:bg-primary hover:text-white">売上{label}の手取りを見る</Link>
          </div>
        </div>

        <ToolFaq items={faqs} />

        <MoreTools current="/tools/furusato" />

        <section className="mt-10 text-sm">
          <h2 className="text-base font-semibold">ほかの売上の上限</h2>
          <div className="mt-2 flex justify-between">
            {prev ? <Link href={`/tools/furusato/${prev}`} className="text-primary hover:underline">← 売上 {prev.toLocaleString('ja-JP')} 万円</Link> : <span />}
            {next ? <Link href={`/tools/furusato/${next}`} className="text-primary hover:underline">売上 {next.toLocaleString('ja-JP')} 万円 →</Link> : <span />}
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {AMOUNTS.map((x) => (
              <li key={x}><Link href={`/tools/furusato/${x}`} className={`inline-block rounded border px-2 py-1 text-xs ${x === a ? 'border-primary bg-primary/10 font-semibold' : 'hover:bg-slate-50'}`}>{x.toLocaleString('ja-JP')}万円</Link></li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">前提: 2026 年中の寄附・2026 年分の所得。独身・扶養なし、国民年金 月 17,920 円、国保は（所得 − 43 万円）× 10% ＋ 均等割 6 万円（上限 109 万円）、住民税の調整控除 2,500 円で概算。実際の控除額はお住まいの自治体・税務署にご確認ください。<Link href="/blog/freelance-furusato-nozei" className="text-primary hover:underline">計算方法と確定申告の書き方の解説はこちら</Link>。</p>
        </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '無料ツール', item: `${SITE_URL}/tools` }, { '@type': 'ListItem', position: 2, name: 'ふるさと納税の上限額', item: `${SITE_URL}/tools/furusato` }, { '@type': 'ListItem', position: 3, name: `売上${label}`, item: `${SITE_URL}/tools/furusato/${a}` }] }) }} />
    </SiteShell>
  )
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <tr className={`border-b border-slate-100 ${bold ? 'font-semibold' : ''}`}>
      <td className="py-1.5 pr-3">{k}</td>
      <td className="py-1.5 text-right tabular-nums whitespace-nowrap">{v}</td>
    </tr>
  )
}
