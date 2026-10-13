import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://freelanceos-eosin.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog', '/signup', '/login', '/terms', '/privacy'],
        disallow: ['/dashboard', '/clients', '/projects', '/revenue', '/export', '/settings', '/admin', '/api/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
