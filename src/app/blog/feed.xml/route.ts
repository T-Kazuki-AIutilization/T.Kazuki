import { ARTICLES } from '@/content/blog'
import { SITE_URL } from '@/lib/site'

// ブログの RSS 2.0 フィード（フィードリーダー・集約サービス向け）
export const dynamic = 'force-static'

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function GET() {
  const items = [...ARTICLES]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((a) => {
      const url = `${SITE_URL}/blog/${a.slug}`
      const pub = new Date(`${a.date}T09:00:00+09:00`).toUTCString()
      return `    <item>
      <title>${esc(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pub}</pubDate>
      <description>${esc(a.description)}</description>
      <enclosure url="${SITE_URL}/blog/og/${a.slug}.png" type="image/png" length="0" />
    </item>`
    })
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FreelanceOS ブログ</title>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <description>フリーランスの請求・入金管理・単価・税金・確定申告の実務ガイド</description>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
}
