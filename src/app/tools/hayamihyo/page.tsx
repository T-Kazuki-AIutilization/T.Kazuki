import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { MoreTools } from '@/components/marketing/more-tools'
import { ExcelUpsell } from '@/components/marketing/excel-upsell'
import { calc, furusatoLimit, requiredSalesFor, TAKEHOME_AMOUNTS, MONTHLY_AMOUNTS, RATE_TARGETS, type Inputs } from '@/lib/takehome'
import { calcNhi, NHI_AMOUNTS, NHI_DEFAULTS } from '@/lib/nhi'
import { employeeTakeHome, KANSAN_SALARIES } from '@/lib/fukugyo'

export const metadata: Metadata = {
  title: 'フリーランス・個人事業主の手取り早見表｜売上別・月単価別・国保・ふるさと納税上限【2026年分】| FreelanceOS',
  description:
    'フリーランス・個人事業主の手取りを売上 300 万〜2,000 万円、月単価 40 万〜150 万円ごとに一覧。ふるさと納税の上限、所得別の国民健康保険料もまとめて確認できます。各金額の内訳ページつき。',
  alternates: { canonical: '/tools/hayamihyo' },
  openGraph: { title: 'フリーランスの手取り早見表【2026年分】| FreelanceOS', description: '売上別・月単価別の手取り、国保、ふるさと納税上限の一覧。', type: 'website', locale: 'ja_JP', images: [{ url: '/blog/og/tools-takehome.png', width: 1200, height: 630 }] },
}

const man = (n: number) => (Math.round(n / 1000) / 10).toLocaleString('ja-JP', { maximumFractionDigits: 1 })
const base = (sales: number, e: number): Inputs => ({ sales, expenses: Math.round(sales * e), aoiro: 650000, other: 0, withheld: 0, taxable: false, bizRate: 0, nhiRate: 0.1 })

export default function HayamihyoPage() {
  const salesRows = TAKEHOME_AMOUNTS.map((a) => {
    const s = a * 10000
    const r = calc(base(s, 0.2))
    const f = furusatoLimit({ sales: s, expenses: Math.round(s * 0.2), aoiro: 650000, other: 0, nhiRate: 0.1 })
    return { a, r, rate: Math.round((r.takeHome / s) * 1000) / 10, limit: f.limit }
  })
  const monthlyRows = MONTHLY_AMOUNTS.map((a) => ({ a, r: calc(base(a * 120000, 0.1)) }))
  const nhiRows = NHI_AMOUNTS.map((a) => ({
    a,
    single: calcNhi({ ...NHI_DEFAULTS, incomes: [a * 10000], members40to64: 0 }).total,
    care: calcNhi({ ...NHI_DEFAULTS, incomes: [a * 10000], members40to64: 1 }).total,
    family: calcNhi({ ...NHI_DEFAULTS, incomes: [a * 10000, 0, 0], members40to64: 0 }).total,
  }))
  const rateRows = RATE_TARGETS.map((a) => { const sales = requiredSalesFor(a * 10000, { expenses: 600000 }); return { a, sales, hourly: Math.ceil(sales / 1152 / 100) * 100 } })
  const kansanRows = KANSAN_SALARIES.map((a) => { const e = employeeTakeHome(a * 10000); return { a, take: e.takeHome, sales: requiredSalesFor(e.takeHome, { expenses: 600000 }) } })
  const th = 'py-2 pr-3 text-left font-medium text-muted-foreground'
  const td = 'py-1.5 pr-3 tabular-nums'
  return (
    <SiteShell>
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <nav className="text-xs text-muted-foreground"><Link href="/tools" className="hover:underline">無料ツール</Link> › 早見表</nav>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">フリーランス・個人事業主の手取り早見表【2026年分】</h1>
        <p className="mt-2 text-sm text-muted-foreground">売上別・月単価別の手取り、ふるさと納税の上限、所得別の国民健康保険料を一覧にしました。金額をクリックすると、税金・保険料の内訳や条件別の試算が見られます。自分の数字で計算するなら<Link href="/tools/takehome" className="text-primary hover:underline">手取り計算シミュレーター</Link>をどうぞ。</p>
        <ul className="mt-4 flex flex-wrap gap-3 text-sm">
          <li><a href="#sales" className="text-primary hover:underline">売上別の手取り</a></li>
          <li><a href="#monthly" className="text-primary hover:underline">月単価別の手取り</a></li>
          <li><a href="#nhi" className="text-primary hover:underline">所得別の国保料</a></li>
          <li><a href="#rate" className="text-primary hover:underline">手取り目標に必要な売上</a></li>
          <li><a href="#kansan" className="text-primary hover:underline">会社員の年収との比較</a></li>
        </ul>

        <section id="sales" className="mt-10">
          <h2 className="text-xl font-bold">売上別の手取りとふるさと納税の上限</h2>
          <p className="mt-1 text-xs text-muted-foreground">経費率 20%・青色申告特別控除 65 万円・独身・消費税の免税事業者</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className={th}>売上</th><th className={th}>税金・保険料</th><th className={th}>手取り</th><th className={th}>手取り率</th><th className={th}>ふるさと納税の上限</th></tr></thead>
              <tbody>
                {salesRows.map(({ a, r, rate, limit }) => (
                  <tr key={a} className="border-b border-slate-100">
                    <td className={td}><Link href={`/tools/takehome/${a}`} className="text-primary hover:underline">{a.toLocaleString('ja-JP')} 万円</Link></td>
                    <td className={td}>{man(r.taxes + r.social)} 万円</td>
                    <td className={`${td} font-semibold`}>{man(r.takeHome)} 万円</td>
                    <td className={td}>{rate}%</td>
                    <td className={td}><Link href={`/tools/furusato/${a}`} className="text-primary hover:underline">約 {limit.toLocaleString('ja-JP')} 円</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="monthly" className="mt-12">
          <h2 className="text-xl font-bold">月単価別の手取り（フリーランスエンジニアなど）</h2>
          <p className="mt-1 text-xs text-muted-foreground">月単価 × 12 か月、経費率 10%・青色申告特別控除 65 万円・独身・消費税の免税事業者</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className={th}>月単価</th><th className={th}>年商</th><th className={th}>年間の手取り</th><th className={th}>月あたりの手取り</th></tr></thead>
              <tbody>
                {monthlyRows.map(({ a, r }) => (
                  <tr key={a} className="border-b border-slate-100">
                    <td className={td}><Link href={`/tools/takehome/monthly/${a}`} className="text-primary hover:underline">{a} 万円</Link></td>
                    <td className={td}>{man(a * 120000)} 万円</td>
                    <td className={td}>{man(r.takeHome)} 万円</td>
                    <td className={`${td} font-semibold`}>{man(r.takeHome / 12)} 万円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="nhi" className="mt-12">
          <h2 className="text-xl font-bold">所得別の国民健康保険料（年額）</h2>
          <p className="mt-1 text-xs text-muted-foreground">所得 ＝ 売上 − 経費 − 青色申告特別控除。例示の料率（医療分 7.7%＋均等割 4.7 万円、支援金分 2.7%＋1.6 万円、介護分 2.2%＋1.6 万円）。自治体で大きく異なります。</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className={th}>所得</th><th className={th}>単身・39 歳以下</th><th className={th}>単身・40〜64 歳</th><th className={th}>夫婦＋子 1 人</th></tr></thead>
              <tbody>
                {nhiRows.map(({ a, single, care, family }) => (
                  <tr key={a} className="border-b border-slate-100">
                    <td className={td}><Link href={`/tools/nhi/${a}`} className="text-primary hover:underline">{a.toLocaleString('ja-JP')} 万円</Link></td>
                    <td className={`${td} font-semibold`}>{man(single)} 万円</td>
                    <td className={td}>{man(care)} 万円</td>
                    <td className={td}>{man(family)} 万円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="rate" className="mt-12">
          <h2 className="text-xl font-bold">目標の手取りに必要な売上と時間単価</h2>
          <p className="mt-1 text-xs text-muted-foreground">経費 60 万円・青色申告特別控除 65 万円・独身。時間単価は年 1,152 時間（週 40 時間 × 48 週 × 請求できる割合 6 割）で計算</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className={th}>目標の手取り</th><th className={th}>必要な売上（年）</th><th className={th}>月あたり</th><th className={th}>時間単価</th></tr></thead>
              <tbody>
                {rateRows.map(({ a, sales, hourly }) => (
                  <tr key={a} className="border-b border-slate-100">
                    <td className={td}><Link href={`/tools/rate/${a}`} className="text-primary hover:underline">{a.toLocaleString('ja-JP')} 万円</Link></td>
                    <td className={`${td} font-semibold`}>{man(sales)} 万円</td>
                    <td className={td}>{man(sales / 12)} 万円</td>
                    <td className={td}>{hourly.toLocaleString('ja-JP')} 円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="kansan" className="mt-12">
          <h2 className="text-xl font-bold">会社員の年収と同じ手取りに必要なフリーランスの売上</h2>
          <p className="mt-1 text-xs text-muted-foreground">会社員は独身・社会保険料を年収の 15% で概算。フリーランスは経費 60 万円・青色申告特別控除 65 万円</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className={th}>会社員の年収</th><th className={th}>会社員の手取り</th><th className={th}>フリーランスに必要な売上</th></tr></thead>
              <tbody>
                {kansanRows.map(({ a, take, sales }) => (
                  <tr key={a} className="border-b border-slate-100">
                    <td className={td}><Link href={`/tools/kansan/${a}`} className="text-primary hover:underline">{a} 万円</Link></td>
                    <td className={td}>{man(take)} 万円</td>
                    <td className={`${td} font-semibold`}>{man(sales)} 万円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-10 text-xs text-muted-foreground">前提: 2026 年分。所得税の基礎控除は合計所得に応じて 95 万〜58 万円、住民税は所得割 10%＋均等割 5,000 円、手取りの計算では国保を（所得 − 43 万円）× 10% ＋ 均等割 6 万円（上限 109 万円）、国民年金 月 17,920 円で概算。配偶者・扶養控除、iDeCo などは含みません。実際の税額・保険料は確定申告書等作成コーナーや自治体の試算でご確認ください。</p>

        <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm">
          <p className="font-semibold">売上と入金をまとめて管理するなら FreelanceOS</p>
          <p className="mt-1 text-muted-foreground">案件ごとの売上・請求・入金をダッシュボードで集計。今年の売上の見込みがいつでもわかるので、納税資金やふるさと納税の計算にも使えます。無料プランあり。</p>
          <Link href="/signup" className="mt-3 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">無料ではじめる</Link> <Link href="/demo" className="ml-3 inline-flex h-9 items-center text-sm text-primary hover:underline">デモ画面を見る</Link>
        </div>
        <ExcelUpsell item="takehome" />
        <MoreTools current="/tools/hayamihyo" />
      </main>
    </SiteShell>
  )
}
