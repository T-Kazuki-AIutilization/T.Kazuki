import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { SiteShell } from '@/components/marketing/site-shell'
import { TEMPLATES } from '@/content/templates'
import { BOOTH_SHOP_URL, SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: 'フリーランス向け Excel テンプレート一覧｜請求書・確定申告・入金管理（無料あり） | FreelanceOS',
  description:
    'フリーランス・個人事業主向けの Excel テンプレート 8 点。インボイス対応の請求書、確定申告準備キット、時間単価計算、手取りシミュレーター、資金繰り表、タイムシート、無料の入金管理台帳。数式はすべて検証済み。',
  alternates: { canonical: '/templates' },
  openGraph: {
    title: 'フリーランス向け Excel テンプレート一覧（無料あり）',
    description: '請求書・確定申告・入金管理・単価計算・資金繰りの実務テンプレート。',
    images: [{ url: '/blog/og/templates.png', width: 1200, height: 630, alt: 'フリーランス向け Excel テンプレート 8 点' }],
    type: 'website',
    locale: 'ja_JP',
  },
}

function yen(n: number) {
  return n === 0 ? '無料' : `¥${n.toLocaleString('ja-JP')}`
}

export default function TemplatesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'フリーランス向け Excel テンプレート',
    itemListElement: TEMPLATES.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: t.name,
        description: t.summary,
        image: `${SITE_URL}${t.image}`,
        url: t.href,
        offers: { '@type': 'Offer', price: String(t.price), priceCurrency: 'JPY', availability: 'https://schema.org/InStock', url: t.href },
      },
    })),
  }
  return (
    <SiteShell>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <h1 className="text-3xl font-bold">フリーランス向け Excel テンプレート</h1>
        <p className="mt-3 text-muted-foreground">
          請求・入金・確定申告・単価・資金繰りの実務を、そのまま使える Excel にしました。数式はすべて検証済みで保護なし。Excel / LibreOffice / Google スプレッドシートで使えます。販売は BOOTH で行っています。
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {TEMPLATES.map((t) => (
            <article key={t.id} className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
              <a href={t.href} target="_blank" rel="noopener noreferrer" className="block border-b bg-slate-50">
                <Image src={t.image} alt={t.name} width={1400} height={700} className="h-44 w-full object-cover object-top" sizes="(max-width: 640px) 100vw, 480px" />
              </a>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold leading-snug">{t.name}</h2>
                  <span className={`shrink-0 rounded px-2 py-0.5 text-sm font-bold ${t.price === 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100'}`}>{yen(t.price)}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t.summary}</p>
                <ul className="mt-3 space-y-1 text-sm">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2"><span className="mt-0.5 text-green-600">✓</span>{f}</li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                  <a href={t.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90">
                    {t.price === 0 ? '無料でダウンロード ↗' : 'BOOTH で見る ↗'}
                  </a>
                  {t.related && (
                    <Link href={t.related.href} className="text-sm text-primary hover:underline">{t.related.label}</Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-12 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <p className="font-semibold">Excel の管理から卒業したい方へ</p>
          <p className="mt-1 text-sm text-muted-foreground">案件・売上・クライアント・入金を 1 画面で管理する Web ツール FreelanceOS を運営しています。無料プラン（クライアント 3 件・案件 10 件/月）があります。</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/signup" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">無料ではじめる</Link>
            <a href={BOOTH_SHOP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-slate-50">BOOTH のショップを見る ↗</a>
          </div>
        </div>
      </main>
    </SiteShell>
  )
}
