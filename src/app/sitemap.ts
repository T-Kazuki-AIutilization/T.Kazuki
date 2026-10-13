import type { MetadataRoute } from 'next'
import { ARTICLES } from '@/content/blog'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://freelanceos-eosin.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date('2026-10-14'), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/blog`, lastModified: new Date('2026-10-14'), changeFrequency: 'weekly', priority: 0.8 },
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
