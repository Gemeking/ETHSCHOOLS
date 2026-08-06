import type { MetadataRoute } from 'next'
import { fetchSchoolCount } from '@/lib/supabase-data'
import { SITE_URL } from '@/lib/site'

// Next.js's generateSitemaps() (used in sitemap.ts to split the sitemap into
// multiple files) replaces the plain /sitemap.xml route entirely — it does
// NOT auto-generate an index there. Listing each chunk directly here is the
// standard, Google-documented way to point crawlers at multiple sitemaps
// without a formal index file.
const CHUNK_SIZE = 40_000

// Same reasoning as sitemap.ts — bounds worst-case compute time for this
// route regardless of database health.
export const maxDuration = 10

export default async function robots(): Promise<MetadataRoute.Robots> {
  let schoolCount = 0
  try {
    schoolCount = await fetchSchoolCount()
  } catch {
    // Query-level timeout in lib/supabase.ts already caps this at ~8s; if it
    // still fails, fall back to a single chunk rather than erroring the route.
  }
  const chunkCount = Math.max(1, Math.ceil(schoolCount / CHUNK_SIZE))
  const sitemaps = Array.from({ length: chunkCount }, (_, i) => `${SITE_URL}/sitemap/${i}.xml`)

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/'],
    },
    sitemap: sitemaps,
  }
}
