import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { activeOffers } from '@/content/affiliates'
import { SiteShell } from '@/components/marketing/site-shell'
import { ARTICLES, getArticle, getFaq, getRelatedArticles, type Block } from '@/content/blog'

type Params = { params: { slug: string } }

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

export function generateMetadata({ params }: Params): Metadata {
  const a = getArticle(params.slug)
  if (!a) return {}
  return {
    title: `${a.title} | FreelanceOS ブログ`,
    description: a.description,
    keywords: a.keywords.join(', '),
    alternates: { canonical: `/blog/${a.slug}`, types: { 'application/rss+xml': '/blog/feed.xml' } },
    openGraph: {
      title: a.title,
      description: a.description,
      type: 'article',
      locale: 'ja_JP',
      publishedTime: a.date,
      modifiedTime: a.updated ?? a.date,
      images: [{ url: `/blog/og/${a.slug}.png`, width: 1200, height: 630, alt: a.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: a.title,
      description: a.description,
      images: [`/blog/og/${a.slug}.png`],
    },
  }
}

function renderBlock(b: Block, i: number) {
  switch (b.type) {
    case 'h2':
      return <h2 key={i} className="mt-10 text-2xl font-bold">{b.text}</h2>
    case 'h3':
      return <h3 key={i} className="mt-6 text-lg font-semibold">{b.text}</h3>
    case 'p':
      return <p key={i} className="mt-4 leading-relaxed text-foreground/90">{b.text}</p>
    case 'ul':
      return (
        <ul key={i} className="mt-4 list-disc space-y-1 pl-6 leading-relaxed">
          {b.items.map((t, j) => <li key={j}>{t}</li>)}
        </ul>
      )
    case 'ol':
      return (
        <ol key={i} className="mt-4 list-decimal space-y-1 pl-6 leading-relaxed">
          {b.items.map((t, j) => <li key={j}>{t}</li>)}
        </ol>
      )
    case 'table':
      return (
        <div key={i} className="mt-4 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>{b.headers.map((h, j) => <th key={j} className="px-3 py-2 text-left font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {b.rows.map((r, j) => (
                <tr key={j} className="border-t">
                  {r.map((c, k) => <td key={k} className="px-3 py-2 align-top">{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'img':
      return (
        <figure key={i} className="mt-6">
          <Image
            src={b.src}
            alt={b.alt}
            width={b.width}
            height={b.height}
            sizes="(max-width: 768px) 100vw, 768px"
            className="w-full rounded-lg border"
          />
          {b.caption ? <figcaption className="mt-2 text-sm text-muted-foreground">{b.caption}</figcaption> : null}
        </figure>
      )
    case 'note':
      return (
        <p key={i} className="mt-6 whitespace-pre-line rounded-lg border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-foreground/80">
          {b.text}
        </p>
      )
    case 'links': {
      const linked = b.items.map((slug) => getArticle(slug)).filter((x): x is NonNullable<typeof x> => Boolean(x))
      if (!linked.length) return null
      return (
        <aside key={i} className="mt-8 rounded-xl border border-dashed bg-white p-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">{b.title ?? 'あわせて読みたい'}</p>
          <ul className="mt-2 space-y-1.5">
            {linked.map((x) => (
              <li key={x.slug} className="text-sm">
                <Link href={`/blog/${x.slug}`} className="text-primary hover:underline">
                  {x.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )
    }
    case 'affiliate': {
      const offers = activeOffers(b.ids)
      if (!offers.length) return null
      return (
        <aside key={i} className="mt-8 rounded-xl border bg-white p-5">
          <p className="flex items-center gap-2 font-semibold"><span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">PR</span>{b.title}</p>
          <ul className="mt-3 space-y-3">
            {offers.map((o) => (
              <li key={o.id} className="text-sm">
                <a href={o.url} target="_blank" rel="sponsored noopener noreferrer" className="font-medium text-primary hover:underline">{o.name} ↗</a>
                <p className="mt-0.5 text-muted-foreground">{o.note}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">このボックスには広告（提携）リンクを含みます。料金・機能は各公式サイトでご確認ください。</p>
        </aside>
      )
    }
    case 'cta':
      return (
        <div key={i} className="mt-8 rounded-xl border bg-slate-50 p-5">
          <p className="font-semibold">{b.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
          {b.external ? (
            <a
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex h-9 items-center rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary hover:bg-primary hover:text-white transition-colors"
            >
              {b.label} ↗
            </a>
          ) : (
            <Link
              href={b.href}
              className="mt-3 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              {b.label}
            </Link>
          )}
          {b.secondary && (
            <a href={b.secondary.href} download={b.secondary.download} className="ml-3 inline-flex h-9 items-center text-sm text-primary hover:underline">
              {b.secondary.label}
            </a>
          )}
        </div>
      )
  }
}

export default function BlogArticlePage({ params }: Params) {
  const a = getArticle(params.slug)
  if (!a) notFound()
  const others = getRelatedArticles(a.slug, 3)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    datePublished: a.date,
    dateModified: a.updated ?? a.date,
    author: { '@type': 'Organization', name: 'FreelanceOS' },
    publisher: { '@type': 'Organization', name: 'FreelanceOS' },
    inLanguage: 'ja',
  }
  const faq = getFaq(a)
  const faqLd = faq.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }
    : null
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
        <p className="text-xs text-muted-foreground">
          <Link href="/blog" className="hover:text-foreground">ブログ</Link> / {a.date.replace(/-/g, '/')} · 約{a.readingMinutes}分
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight">{a.title}</h1>
        <p className="mt-4 text-muted-foreground">{a.description}</p>
        <article>{a.blocks.map(renderBlock)}</article>
        {others.length > 0 && (
          <section className="mt-14 border-t pt-8">
            <h2 className="text-lg font-semibold">関連記事</h2>
            <ul className="mt-3 space-y-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link href={`/blog/${o.slug}`} className="text-primary hover:underline">{o.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </SiteShell>
  )
}
