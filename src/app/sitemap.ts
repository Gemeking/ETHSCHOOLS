import type { MetadataRoute } from 'next'
import { fetchAllSchools } from '@/lib/supabase-data'
import { fetchAllUniversities } from '@/lib/supabase-universities'
import { schools as localSchools } from '@/lib/data'
import { universities as localUniversities } from '@/lib/university-data'
import { SITE_URL, schoolPath, universityPath, citySlug } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  let schools = localSchools
  let universities = localUniversities
  try {
    schools = await fetchAllSchools()
    universities = await fetchAllUniversities()
  } catch {
    // fall back to bundled data if Supabase is unreachable at build time
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                   lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/schools`,      lastModified: now, changeFrequency: 'daily',   priority: 0.95 },
    { url: `${SITE_URL}/universities`, lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE_URL}/map`,          lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]

  const typeRoutes: MetadataRoute.Sitemap = ['international', 'private', 'public', 'tvet'].map((t) => ({
    url: `${SITE_URL}/schools/type/${t}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  const citySlugs = new Set<string>()
  for (const s of schools) {
    if (s.sub_city) citySlugs.add(citySlug(s.sub_city))
  }
  const cityRoutes: MetadataRoute.Sitemap = Array.from(citySlugs).filter(Boolean).map((c) => ({
    url: `${SITE_URL}/schools/in/${c}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  const schoolRoutes: MetadataRoute.Sitemap = schools.map((s) => ({
    url: `${SITE_URL}${schoolPath(s)}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const universityRoutes: MetadataRoute.Sitemap = universities.map((u) => ({
    url: `${SITE_URL}${universityPath(u)}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...typeRoutes, ...cityRoutes, ...schoolRoutes, ...universityRoutes]
}
