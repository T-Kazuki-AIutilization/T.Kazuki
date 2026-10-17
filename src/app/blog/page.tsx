import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { ARTICLES, BOOTH_LEDGER_FREE_URL, CATEGORIES, LEDGER_DOWNLOAD_URL, categoryOf } from '@/content/blog'

export const metadata: Metadata = {
  title: 'ブログ｜フリーランスの案件管理・入金管理・確定申告のコツ | FreelanceOS',
  description:
    'フリーランス・個人事業主向けに、案件管理ツールの選び方、未入金を防ぐ入金管理、時間単価の計算、確定申告の準備を実務目線で解説します。',
  alternates: { canonical: '/blog', types: { 'application/rss+xml': '/blog/feed.xml' } },
  openGraph: {
    title: 'FreelanceOS ブログ',
    description: 'フリーランスの事業管理を楽にする実務ガイド。',
    type: 'website',
    locale: 'ja_JP',
  },
}

export default function BlogIndexPage() {
  const sorted = [...ARTICLES].sort((a, b) => (a.date < b.date ? 1 : -1))
  const groups = [
    ...CATEGORIES.map((c) => ({ ...c, articles: sorted.filter((a) => c.slugs.includes(a.slug)) })),
    { id: 'other', name: 'その他', description: '', articles: sorted.filter((a) => !categoryOf(a.slug)) },
  ].filter((g) => g.articles.length > 0)
  return (
    <SiteShell>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">ブログ</h1>
          <p className="mt-2 text-muted-foreground">
            フリーランスの案件管理・入金管理・確定申告を、実務で使える形で解説します。
          </p>
        </div>
        <nav aria-label="カテゴリ" className="mb-8 flex flex-wrap gap-2">
          {groups.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="rounded-full border px-3 py-1 text-sm hover:bg-slate-50">
              {g.name} <span className="text-muted-foreground">{g.articles.length}</span>
            </a>
          ))}
        </nav>
        <section className="mb-10">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">新着</h2>
          <ul className="mt-3 space-y-2">
            {sorted.slice(0, 3).map((a) => (
              <li key={a.slug} className="text-sm">
                <Link href={`/blog/${a.slug}`} className="text-primary hover:underline">{a.title}</Link>
                <span className="ml-2 text-xs text-muted-foreground">{a.date.replace(/-/g, '/')}</span>
              </li>
            ))}
          </ul>
        </section>
        {groups.map((g) => (
          <section key={g.id} id={g.id} className="mb-12 scroll-mt-24">
            <h2 className="text-xl font-bold">{g.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>
            <ul className="mt-4 space-y-4">
              {g.articles.map((a) => (
                <li key={a.slug} className="rounded-xl border p-5 transition-shadow hover:shadow-sm">
                  <Link href={`/blog/${a.slug}`} className="block">
                    <h3 className="text-lg font-semibold hover:text-primary">{a.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {a.date.replace(/-/g, '/')} · 約{a.readingMinutes}分
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <div className="mt-12 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <p className="font-semibold">無料の Excel 入金管理台帳を配布しています</p>
          <p className="mt-1 text-sm text-muted-foreground">請求番号・支払期限・入金日を記録するだけで、未入金と期限超過を自動で色分け。月別集計つき。</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a href={LEDGER_DOWNLOAD_URL} download className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90">無料でダウンロード（登録不要・xlsx）</a>
            <a href={BOOTH_LEDGER_FREE_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">BOOTH でも配布中 ↗</a>
          </div>
        </div>
      </main>
    </SiteShell>
  )
}
