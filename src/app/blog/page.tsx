import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { ARTICLES, BOOTH_LEDGER_FREE_URL } from '@/content/blog'

export const metadata: Metadata = {
  title: 'ブログ｜フリーランスの案件管理・入金管理・確定申告のコツ | FreelanceOS',
  description:
    'フリーランス・個人事業主向けに、案件管理ツールの選び方、未入金を防ぐ入金管理、時間単価の計算、確定申告の準備を実務目線で解説します。',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'FreelanceOS ブログ',
    description: 'フリーランスの事業管理を楽にする実務ガイド。',
    type: 'website',
    locale: 'ja_JP',
  },
}

export default function BlogIndexPage() {
  const sorted = [...ARTICLES].sort((a, b) => (a.date < b.date ? 1 : -1))
  return (
    <SiteShell>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">ブログ</h1>
          <p className="mt-2 text-muted-foreground">
            フリーランスの案件管理・入金管理・確定申告を、実務で使える形で解説します。
          </p>
        </div>
        <ul className="space-y-6">
          {sorted.map((a) => (
            <li key={a.slug} className="rounded-xl border p-5 transition-shadow hover:shadow-sm">
              <Link href={`/blog/${a.slug}`} className="block">
                <h2 className="text-lg font-semibold hover:text-primary">{a.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {a.date.replace(/-/g, '/')} · 約{a.readingMinutes}分
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-12 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <p className="font-semibold">無料の Excel 入金管理台帳を配布しています</p>
          <p className="mt-1 text-sm text-muted-foreground">請求番号・支払期限・入金日を記録するだけで、未入金と期限超過を自動で色分け。月別集計つき。</p>
          <a href={BOOTH_LEDGER_FREE_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex h-10 items-center rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white">BOOTH で無料ダウンロード ↗</a>
        </div>
      </main>
    </SiteShell>
  )
}
