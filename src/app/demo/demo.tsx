'use client'
import Link from 'next/link'
import { StatCard } from '@/components/features/stat-card'
import { MonthlyTrendChart } from '@/components/features/monthly-trend-chart'
import { Banknote, CreditCard, AlertCircle, FolderKanban } from 'lucide-react'

const yen = (n: number) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(n)

function monthKey(offset: number) {
  const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function day(offset: number) {
  const d = new Date(); d.setDate(d.getDate() + offset)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// すべて架空のサンプルデータ
const TREND = [-5, -4, -3, -2, -1, 0].map((o, i) => {
  const rev = [520000, 610000, 480000, 700000, 650000, 580000][i]
  const paid = [520000, 610000, 480000, 640000, 450000, 220000][i]
  return { month: monthKey(o), revenue: rev, paidAmount: paid }
})
const PROJECTS = [
  { title: 'コーポレートサイト改修', client: '株式会社サンプル商事', amount: 330000, status: '進行中', due: day(12) },
  { title: '採用ページのデザイン', client: 'デモ工業株式会社', amount: 165000, status: '納品済み', due: day(-2) },
  { title: '月次の記事制作（10 本）', client: 'テスト出版合同会社', amount: 220000, status: '請求済み', due: day(18) },
  { title: 'LP 制作', client: '架空フーズ株式会社', amount: 198000, status: '請求済み', due: day(-4) },
  { title: '保守・運用（月額）', client: '株式会社サンプル商事', amount: 55000, status: '入金済み', due: day(-10) },
]
const BADGE: Record<string, string> = {
  '進行中': 'bg-blue-50 text-blue-700', '納品済み': 'bg-amber-50 text-amber-700', '請求済み': 'bg-orange-50 text-orange-700', '入金済み': 'bg-green-50 text-green-700',
}
const UNPAID = [
  { title: 'LP 制作', client: '架空フーズ株式会社', amount: 198000, due: day(-4), overdue: true },
  { title: '月次の記事制作（10 本）', client: 'テスト出版合同会社', amount: 220000, due: day(18), overdue: false },
]

export function Demo() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
        <p>これは<strong>デモ画面</strong>です（すべて架空のサンプルデータ。操作・保存はできません）。</p>
        <Link href="/signup" className="inline-flex h-9 items-center rounded-md bg-primary px-4 font-medium text-white hover:bg-primary/90">無料で自分の案件を管理する</Link>
      </div>

      <h2 className="text-lg font-bold">ダッシュボード</h2>
      <p className="mt-1 text-sm text-muted-foreground">今月の売上・入金・未入金・進行中の案件を 1 画面で確認できます。</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="今月の売上" value={yen(580000)} icon={Banknote} />
        <StatCard label="入金済み" value={yen(220000)} icon={CreditCard} />
        <StatCard label="未入金" value={yen(418000)} icon={AlertCircle} sublabel="うち期限超過 1 件" />
        <StatCard label="進行中の案件" value="3件" icon={FolderKanban} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-4 shadow-sm lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold">月次売上推移（直近 6 か月）</h3>
          <MonthlyTrendChart data={TREND} />
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold">入金予定・未入金</h3>
          <ul className="space-y-3">
            {UNPAID.map((u) => (
              <li key={u.title} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{u.title}</p>
                  <p className="text-xs text-muted-foreground">{u.due} · {u.client}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{yen(u.amount)}</span>
                  {u.overdue && <p className="text-xs font-medium text-red-600">期限超過</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="mt-12 text-lg font-bold">案件一覧</h2>
      <p className="mt-1 text-sm text-muted-foreground">案件ごとに金額・期限・ステータスを管理。案件からそのまま見積書・納品書・請求書（PDF）を作れます。</p>
      <div className="mt-4 overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-slate-50 text-left text-xs text-muted-foreground"><th className="px-4 py-2">案件名</th><th className="px-4 py-2">クライアント</th><th className="px-4 py-2 text-right">金額</th><th className="px-4 py-2">ステータス</th><th className="px-4 py-2">期限</th><th className="px-4 py-2"></th></tr></thead>
          <tbody>
            {PROJECTS.map((p) => (
              <tr key={p.title} className="border-b last:border-0">
                <td className="px-4 py-2.5 font-medium">{p.title}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{p.client}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{yen(p.amount)}</td>
                <td className="px-4 py-2.5"><span className={`rounded px-2 py-0.5 text-xs font-medium ${BADGE[p.status]}`}>{p.status}</span></td>
                <td className="px-4 py-2.5 text-muted-foreground">{p.due}</td>
                <td className="px-4 py-2.5 text-xs text-primary">請求書を作る</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 text-lg font-bold">こんな流れで使います</h2>
      <ol className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['1. クライアントと案件を登録', '取引先と、案件ごとの金額・納期を登録します。'],
          ['2. 見積書・請求書を作る', '案件から PDF を作成。消費税・源泉徴収も自動計算。'],
          ['3. 請求済みとして記録', '請求書を作ったら 1 クリックで売上に記録されます。'],
          ['4. 入金を確認', '入金日を入れると、未入金・期限超過が一目でわかります。'],
        ].map(([t, d]) => (
          <li key={t} className="rounded-lg border bg-white p-4"><p className="font-semibold">{t}</p><p className="mt-1 text-muted-foreground">{d}</p></li>
        ))}
      </ol>

      <div className="mt-12 rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
        <p className="text-lg font-semibold">自分の案件と入金を管理してみる</p>
        <p className="mt-1 text-sm text-muted-foreground">無料プランから使えます。クレジットカードの登録は不要です。</p>
        <Link href="/signup" className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-white hover:bg-primary/90">無料ではじめる</Link>
      </div>
    </div>
  )
}
