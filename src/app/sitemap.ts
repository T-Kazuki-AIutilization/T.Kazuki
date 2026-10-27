import type { MetadataRoute } from 'next'
import { ARTICLES } from '@/content/blog'

import { SITE_URL } from '@/lib/site'
import { TAKEHOME_AMOUNTS, MONTHLY_AMOUNTS, RATE_TARGETS } from '@/lib/takehome'
import { NHI_AMOUNTS } from '@/lib/nhi'
import { KANSAN_SALARIES } from '@/lib/fukugyo'

const BASE = SITE_URL

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date('2026-10-14'), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/blog`, lastModified: new Date('2026-10-14'), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/templates`, lastModified: new Date('2026-10-16'), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/tools`, lastModified: new Date('2026-10-18'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/tools/invoice`, lastModified: new Date('2026-10-18'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/takehome`, lastModified: new Date('2026-10-18'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/rate`, lastModified: new Date('2026-10-18'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/tools/withholding`, lastModified: new Date('2026-10-18'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/tools/nhi`, lastModified: new Date('2026-10-20'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/tools/hayamihyo`, lastModified: new Date('2026-10-22'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/fukugyo`, lastModified: new Date('2026-10-22'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/aoiro`, lastModified: new Date('2026-10-23'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/anbun`, lastModified: new Date('2026-10-24'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/kakutei-checklist`, lastModified: new Date('2026-10-25'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/kyosai`, lastModified: new Date('2026-10-26'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/iryohi`, lastModified: new Date('2026-10-27'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/furusato`, lastModified: new Date('2026-10-21'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/signup`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/ad-policy`, changeFrequency: 'yearly', priority: 0.2 },
  ]
  const articles: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${BASE}/blog/${a.slug}`,
    lastModified: new Date(a.updated ?? a.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))
  const takehome: MetadataRoute.Sitemap = TAKEHOME_AMOUNTS.map((a) => ({
    url: `${BASE}/tools/takehome/${a}`,
    lastModified: new Date('2026-10-21'),
    changeFrequency: 'yearly',
    priority: 0.6,
  }))
  const furusato: MetadataRoute.Sitemap = TAKEHOME_AMOUNTS.map((a) => ({
    url: `${BASE}/tools/furusato/${a}`,
    lastModified: new Date('2026-10-21'),
    changeFrequency: 'yearly',
    priority: 0.6,
  }))
  const nhi: MetadataRoute.Sitemap = NHI_AMOUNTS.map((a) => ({
    url: `${BASE}/tools/nhi/${a}`,
    lastModified: new Date('2026-10-21'),
    changeFrequency: 'yearly',
    priority: 0.6,
  }))
  const monthly: MetadataRoute.Sitemap = MONTHLY_AMOUNTS.map((a) => ({
    url: `${BASE}/tools/takehome/monthly/${a}`,
    lastModified: new Date('2026-10-22'),
    changeFrequency: 'yearly',
    priority: 0.6,
  }))
  const rate: MetadataRoute.Sitemap = RATE_TARGETS.map((a) => ({
    url: `${BASE}/tools/rate/${a}`,
    lastModified: new Date('2026-10-22'),
    changeFrequency: 'yearly',
    priority: 0.6,
  }))
  const kansan: MetadataRoute.Sitemap = KANSAN_SALARIES.map((a) => ({
    url: `${BASE}/tools/kansan/${a}`,
    lastModified: new Date('2026-10-23'),
    changeFrequency: 'yearly',
    priority: 0.6,
  }))
  return [...staticPages, ...articles, ...takehome, ...furusato, ...nhi, ...monthly, ...rate, ...kansan]
}
