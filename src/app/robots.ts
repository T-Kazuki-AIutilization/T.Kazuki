import type { MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/site'

const BASE = SITE_URL

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog', '/templates', '/tools', '/downloads', '/signup', '/login', '/terms', '/privacy', '/tokusho', '/ad-policy'],
        disallow: ['/dashboard', '/clients', '/projects', '/revenue', '/export', '/settings', '/admin', '/api/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
