import type { MetadataRoute } from 'next'
import { fetchAllSchoolSlugs, type SchoolSlugInfo } from '@/lib/supabase-data'
import { fetchAllUniversities } from '@/lib/supabase-universities'
import { schools as localSchools } from '@/lib/data'
import { universities as localUniversities } from '@/lib/university-data'
import { SITE_URL, schoolPath, universityPath, citySlug } from '@/lib/site'

export const revalidate = 3600
// Hard cap on this route's execution time. Vercel bills Fluid Compute for
// however long a function actually runs, including time spent waiting on a
// slow/unhealthy database — an unbounded hang here is what burned through
// the account's compute quota and got the whole account paused. Combined
// with the query-level timeout in lib/supabase.ts, this is a second,
// independent backstop.
export const maxDuration = 15

// Google caps a single sitemap file at 50,000 URLs. Well under that per
// chunk gives headroom as the catalog keeps growing.
const CHUNK_SIZE = 40_000

async function loadData() {
  let schools: SchoolSlugInfo[] = localSchools
  let universities = localUniversities
  try {
    const fetched = await fetchAllSchoolSlugs()
    if (fetched.length > 0) schools = fetched
    universities = await fetchAllUniversities()
  } catch {
    // fall back to bundled data if Supabase is unreachable at build time
  }
  return { schools, universities }
}

// Everything that isn't a per-school route — small and stable regardless of
// catalog size, so it always lives in chunk 0.
async function fixedRoutes(now: Date): Promise<MetadataRoute.Sitemap> {
  const { schools, universities } = await loadData()

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

  const universityRoutes: MetadataRoute.Sitemap = universities.map((u) => ({
    url: `${SITE_URL}${universityPath(u)}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...typeRoutes, ...cityRoutes, ...universityRoutes]
}

export async function generateSitemaps() {
  const { schools } = await loadData()
  const fixedCount = 1 // fixedRoutes bundle counts as one "slot" worth, folded into chunk 0
  const schoolChunks = Math.max(1, Math.ceil(schools.length / CHUNK_SIZE))
  return Array.from({ length: schoolChunks }, (_, i) => ({ id: i }))
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const { schools } = await loadData()

  const start = id * CHUNK_SIZE
  const end = start + CHUNK_SIZE
  const schoolRoutes: MetadataRoute.Sitemap = schools.slice(start, end).map((s) => ({
    url: `${SITE_URL}${schoolPath(s)}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // Fixed (non-school) routes ride along in the first chunk only.
  if (id === 0) {
    return [...(await fixedRoutes(now)), ...schoolRoutes]
  }
  return schoolRoutes
}
