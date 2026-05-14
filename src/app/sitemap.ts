import type { MetadataRoute } from 'next'
import { schools } from '@/lib/data'
import { universities } from '@/lib/university-data'

const BASE = 'https://ethschools.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                   lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/schools`,      lastModified: now, changeFrequency: 'daily',   priority: 0.95 },
    { url: `${BASE}/universities`, lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/map`,          lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]

  const schoolRoutes: MetadataRoute.Sitemap = schools.map((s) => ({
    url: `${BASE}/schools/${s.id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const universityRoutes: MetadataRoute.Sitemap = universities.map((u) => ({
    url: `${BASE}/universities/${u.id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...schoolRoutes, ...universityRoutes]
}
