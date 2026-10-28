import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteShell } from '@/components/marketing/site-shell'
import { ToolFaq } from '@/components/marketing/tool-faq'
import { MoreTools } from '@/components/marketing/more-tools'
import { ExcelUpsell } from '@/components/marketing/excel-upsell'
import { SITE_URL } from '@/lib/site'
import { sideJobTax, kyuyoShotoku, furusatoLimitEmployee, BASIC_STEPS, FUKUGYO_PAGES as AMOUNTS, FUKUGYO_PAGE_SIDES as SIDES } from '@/lib/fukugyo'

// 会社の年収別に、副業の所得ごとに増える所得税・住民税をまとめたページ。計算は副業の税金計算ツール（/tools/fukugyo）と同じ。
export const dynamicParams = false

const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })
const pct = (n: number) => `${Math.round(n * 100)}%`

/** 副業の所得で基礎控除の境目（合計所得 489 万円・655 万円）を超える年収なら、境目の前後 1 万円で増える税金を返す */
function steps(salary: number) {
  const base = kyuyoShotoku(salary)
  return BASIC_STEPS.map((s) => {
    const th = s.limit - base
    if (th <= 0 || th > 3000000) return null
    const before = Math.floor(th / 10000) * 10000
    const after = before + 10000
    return { ...s, th, before, after, jump: sideJobTax(salary, after).total - sideJobTax(salary, before).total }
  }).filter((x): x is NonNullable<typeof x> => x !== null)
}

export function generateStaticParams() {
  return AMOUNTS.map((a) => ({ salary: String(a) }))
}

export function generateMetadata({ params }: { params: { salary: string } }): Metadata {
  const a = Number(params.salary)
  if (!AMOUNTS.includes(a)) return {}
  const r50 = sideJobTax(a * 10000, 500000)
  const r100 = sideJobTax(a * 10000, 1000000)
  const title = `年収${a}万円の会社員の副業の税金はいくら？副業50万円で約${man(r50.total)}万円、100万円で約${man(r100.total)}万円【2026年分】| FreelanceOS`
  const description = `年収 ${a} 万円の会社員が副業で稼いだときに増える所得税・住民税を、副業の所得 10〜300 万円の早見表で。副業 50 万円なら税金 約 ${man(r50.total)} 万円・手元に 約 ${man(r50.keep)} 万円。20 万円ルール、2026 年分の基礎控除の境目（合計所得 489 万円）、ふるさと納税の上限も。`
  return {
    title,
    description,
    alternates: { canonical: `/tools/fukugyo/${a}` },
    openGraph: { title, description, type: 'article', locale: 'ja_JP', images: [{ url: '/blog/og/tools-fukugyo.png', width: 1200, height: 630 }] },
  }
}

export default function FukugyoSalaryPage({ params }: { params: { salary: string } }) {
  const a = Number(params.salary)
  if (!AMOUNTS.includes(a)) notFound()
  const salary = a * 10000
  const label = `${a}万円`
  const rows = SIDES.map((s) => ({ s, r: sideJobTax(salary, s * 10000) }))
  const r50 = sideJobTax(salary, 500000)
  const r100 = sideJobTax(salary, 1000000)
  const st = steps(salary)
  const furusato = [0, 50, 100].map((s) => ({ s, limit: furusatoLimitEmployee(salary, s * 10000) }))
  const idx = AMOUNTS.indexOf(a)
  const prev = AMOUNTS[idx - 1]
  const next = AMOUNTS[idx + 1]
  const faqs = [
    { q: `年収${label}の会社員が副業で50万円稼ぐと、税金はいくら増える？`, a: `副業の所得（売上 − 経費）が 50 万円なら、所得税が 約 ${man(r50.incomeTax)} 万円、住民税が 約 ${man(r50.residentTax)} 万円増え、合計 約 ${man(r50.total)} 万円です。手元に残るのは 約 ${man(r50.keep)} 万円（${pct(r50.keep / 500000)}）。副業の所得には給与の続きの税率（この年収なら所得税 ${pct(r50.rate)}）と住民税 10% がかかります。` },
    { q: '副業が 20 万円以下なら税金はかからない？', a: '所得税は、年末調整を受けている会社員で副業の所得が 20 万円以下なら確定申告が不要で、かかりません。住民税にはこのルールがないため、市区町村への申告が必要で、所得の約 10% が増えます。' },
    { q: '副業で会社の社会保険料は増える？', a: '業務委託・フリマ・ブログ収入などの事業所得・雑所得なら、会社の健康保険料・厚生年金保険料は給与で決まるため増えません。副業がアルバイトなど給与の場合は、勤務時間などによって副業先で社会保険に入ることがあります。' },
  ]
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="text-xs text-muted-foreground"><Link href="/tools" className="hover:underline">無料ツール</Link> › <Link href="/tools/fukugyo" className="hover:underline">副業の税金計算</Link> › 年収{label}</nav>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">年収{label}の会社員が副業で稼ぐと、税金はいくら増える？【2026年分】</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">会社の年収（額面）{label}・独身・扶養なしの会社員が、副業で所得（売上 − 経費）を得たときに増える所得税と住民税の目安です。2026 年度の税制改正（基礎控除 104 万円など）を反映しています。</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-muted-foreground">副業の所得 50 万円</p><p className="mt-1 text-2xl font-bold">税金 約 {man(r50.total)} 万円</p><p className="text-xs text-muted-foreground">所得税 約 {man(r50.incomeTax)} 万・住民税 約 {man(r50.residentTax)} 万／手元に 約 {man(r50.keep)} 万円</p></div>
          <div className="rounded-xl border bg-white p-4"><p className="text-xs text-muted-foreground">副業の所得 100 万円</p><p className="mt-1 text-2xl font-bold">税金 約 {man(r100.total)} 万円</p><p className="text-xs text-muted-foreground">所得税 約 {man(r100.incomeTax)} 万・住民税 約 {man(r100.residentTax)} 万／手元に 約 {man(r100.keep)} 万円</p></div>
        </div>

        <h2 className="mt-10 text-xl font-bold">副業の所得別: 増える税金と手元に残る額</h2>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2">副業の所得</th><th className="text-right">所得税</th><th className="text-right">住民税</th><th className="text-right">合計</th><th className="text-right">手元に残る額</th></tr></thead>
            <tbody>
              {rows.map(({ s, r }) => (
                <tr key={s} className="border-b border-slate-100">
                  <td className="py-1.5">{s} 万円</td>
                  <td className="text-right tabular-nums">{r.rule20 ? '0 円' : `${man(r.incomeTax)} 万円`}</td>
                  <td className="text-right tabular-nums">{man(r.residentTax)} 万円</td>
                  <td className="text-right tabular-nums font-semibold">{man(r.total)} 万円</td>
                  <td className="text-right tabular-nums">{man(r.keep)} 万円（{pct(r.keep / (s * 10000))}）</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">所得税は復興特別所得税（2.1%）込み。20 万円以下は 20 万円ルールで所得税 0（住民税の申告は必要）。所得は売上ではなく売上から経費を引いた額です。</p>

        {st.length > 0 && (
          <section className="mt-10 rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm leading-relaxed">
            <h2 className="text-base font-semibold">基礎控除が下がる境目に注意（2026 年分）</h2>
            {st.map((x) => (
              <p key={x.limit} className="mt-2">副業の所得が約 {man(x.th)} 万円を超えると、合計所得が {man(x.limit)} 万円を超えて所得税の基礎控除が {man(x.from)} 万円から {man(x.to)} 万円に下がります。副業の所得が {man(x.before)} 万円から {man(x.after)} 万円に 1 万円増えるだけで、税金は約 {man(x.jump)} 万円増えます。</p>
            ))}
            <p className="mt-2 text-muted-foreground">境目の判定に使う合計所得には、iDeCo・生命保険料などの所得控除は効きません。経費の計上漏れがないか確認しましょう。<Link href="/blog/side-job-nenmatsu-chosei-2026" className="text-primary hover:underline">2026 年の年末調整と基礎控除の境目 →</Link></p>
          </section>
        )}

        <h2 className="mt-10 text-xl font-bold">ふるさと納税の上限額も上がる</h2>
        <table className="mt-3 w-full text-sm">
          <tbody>
            {furusato.map(({ s, limit }) => (
              <tr key={s} className="border-b border-slate-100"><td className="py-1.5">{s === 0 ? '副業なし' : `副業の所得 ${s} 万円`}</td><td className="py-1.5 text-right tabular-nums">約 {man(limit)} 万円</td></tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-sm text-muted-foreground">副業の申告（確定申告・住民税の申告）をすると、ワンストップ特例は無効になります。寄附金控除は申告書に書きます。<Link href="/blog/side-job-furusato-nozei" className="text-primary hover:underline">副業がある会社員のふるさと納税 →</Link></p>

        <div className="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm">
          <p className="font-semibold">自分の金額で計算する</p>
          <p className="mt-1 text-muted-foreground">会社の年収と副業の売上・経費を入れると、増える税金・手元に残る額・ふるさと納税の上限を計算します（無料・登録不要）。</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/tools/fukugyo" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">副業の税金計算ツール</Link>
            <Link href="/blog/side-job-tax-return-200k" className="inline-flex h-9 items-center rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary hover:bg-primary hover:text-white">20 万円ルールの条件</Link>
          </div>
        </div>

        <section className="mt-10 text-sm leading-relaxed">
          <h2 className="text-base font-semibold">副業の税金で押さえておくこと</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>副業の所得が 20 万円を超えたら確定申告（翌年 2 月 16 日〜3 月 15 日）。<Link href="/blog/side-job-tax-return-200k" className="text-primary hover:underline">20 万円ルール</Link></li>
            <li>20 万円以下でも住民税の申告は必要。副業分の住民税は「自分で納付（普通徴収）」を選べることが多い。<Link href="/blog/side-job-juminzei-shinkoku" className="text-primary hover:underline">副業の住民税</Link></li>
            <li>副業のための PC・ソフト・通信費の業務分などは経費になる。<Link href="/blog/freelance-expenses-list" className="text-primary hover:underline">経費にできるもの一覧</Link></li>
            <li>入金のたびに所得の {pct(Math.ceil((r50.total / 500000) * 10) / 10)} 前後を税金用に取り分けておくと安心。</li>
          </ul>
        </section>

        <ExcelUpsell item="tax" />
        <ToolFaq items={faqs} />

        <section className="mt-10 text-sm">
          <h2 className="text-base font-semibold">ほかの年収で見る</h2>
          <div className="mt-2 flex justify-between">
            {prev ? <Link href={`/tools/fukugyo/${prev}`} className="text-primary hover:underline">← 年収 {prev} 万円</Link> : <span />}
            {next ? <Link href={`/tools/fukugyo/${next}`} className="text-primary hover:underline">年収 {next} 万円 →</Link> : <span />}
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {AMOUNTS.map((x) => (
              <li key={x}><Link href={`/tools/fukugyo/${x}`} className={`inline-block rounded border px-2 py-1 text-xs ${x === a ? 'border-primary bg-primary/10 font-semibold' : 'hover:bg-slate-50'}`}>年収 {x.toLocaleString('ja-JP')}万円</Link></li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">前提: 2026 年分、独身・扶養なし。給与所得控除（2026 年分）、社会保険料は年収の 15%、所得税の基礎控除は合計所得に応じて 104 万〜62 万円、住民税は所得割 10%（基礎控除 43 万円・調整控除 2,500 円）。副業は事業所得・雑所得として給与と合算。扶養控除・生命保険料控除・iDeCo などは含みません。概算です。</p>
        </section>
        <MoreTools current="/tools/fukugyo" />
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '無料ツール', item: `${SITE_URL}/tools` }, { '@type': 'ListItem', position: 2, name: '副業の税金計算', item: `${SITE_URL}/tools/fukugyo` }, { '@type': 'ListItem', position: 3, name: `年収${label}`, item: `${SITE_URL}/tools/fukugyo/${a}` }] }) }} />
    </SiteShell>
  )
}
