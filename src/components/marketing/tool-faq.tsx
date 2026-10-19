/** ツールページ用の FAQ（表示＋FAQPage 構造化データ） */
export type Faq = { q: string; a: string }

export function ToolFaq({ items, title = 'よくある質問' }: { items: Faq[]; title?: string }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
  return (
    <section className="mt-10 print:hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <dl className="mt-3 space-y-4">
        {items.map((f) => (
          <div key={f.q}>
            <dt className="font-medium text-foreground">{f.q}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
