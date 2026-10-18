import type { MetadataRoute } from 'next'
import { ARTICLES } from '@/content/blog'

import { SITE_URL } from '@/lib/site'

const BASE = SITE_URL

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date('2026-10-14'), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/blog`, lastModified: new Date('2026-10-14'), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/templates`, lastModified: new Date('2026-10-16'), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/tools/invoice`, lastModified: new Date('2026-10-18'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/signup`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  ]
  const articles: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${BASE}/blog/${a.slug}`,
    lastModified: new Date(a.updated ?? a.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))
  return [...staticPages, ...articles]
}
