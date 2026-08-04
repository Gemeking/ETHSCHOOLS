import { unstable_cache } from 'next/cache'
import { supabase } from './supabase'
import { schools as localSchools } from './data'
import type { School } from './types'
import { parseFeeMin, parseFeeMax } from './utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(s: any): School {
  const images: string[] = Array.isArray(s.images) ? s.images : s.image_url ? [s.image_url] : []
  return {
    ...(s as School),
    images,
    image_url: images[0] ?? null,
    tags: Array.isArray(s.tags) ? (s.tags as string[]) : [],
    fee_min: s.fee_min ?? parseFeeMin(s.fee_range_etb ?? ''),
    fee_max: s.fee_max ?? parseFeeMax(s.fee_range_etb ?? ''),
  }
}

// PostgREST caps any single request at 1,000 rows regardless of table size —
// silently, with no error — so a plain .select('*') on a 67,000+ row table
// only ever returns the first 1,000. Page through in batches to get
// everything.
const FETCH_PAGE_SIZE = 1000

// Firing all ~68 range requests in one Promise.all() at once turned out to
// be too much simultaneous load on Supabase during a build (many pages
// calling this concurrently compounds it further) — caused intermittent
// "fetch failed" errors and 60s worker timeouts. Batching a limited number
// of requests at a time is gentler and still fast.
const FETCH_CONCURRENCY = 10

async function fetchAllRowsPaged<T>(table: string, columns: string): Promise<T[] | null> {
  const { count, error: countError } = await supabase.from(table).select('id', { count: 'exact', head: true })
  if (countError || count === null) {
    console.log(`${table} count failed:`, countError?.message)
    return null
  }

  const pageCount = Math.max(1, Math.ceil(count / FETCH_PAGE_SIZE))
  const results: T[][] = []
  for (let batchStart = 0; batchStart < pageCount; batchStart += FETCH_CONCURRENCY) {
    const batchIndexes = Array.from(
      { length: Math.min(FETCH_CONCURRENCY, pageCount - batchStart) },
      (_, j) => batchStart + j
    )
    const batch = await Promise.all(
      batchIndexes.map((i) => {
        const from = i * FETCH_PAGE_SIZE
        const to = from + FETCH_PAGE_SIZE - 1
        return supabase.from(table).select(columns).order('id').range(from, to)
      })
    )
    const failed = batch.find((p) => p.error)
    if (failed?.error || batch.some((p) => !p.data)) {
      console.log(`${table} fetch failed:`, failed?.error?.message)
      return null
    }
    results.push(...batch.map((p) => p.data as T[]))
  }
  return results.flat()
}

// Plain module-level cache — correct and sufficient here, because every
// caller of fetchAllSchools() (generateStaticParams, generateMetadata, etc.)
// runs during `next build`, a single process, so this is genuinely shared.
// (unstable_cache was tried here too, but its file-backed cache caused lock
// contention between Next's parallel build workers and broke the build
// outright — worse than the problem it was meant to solve. It's used below,
// scoped only to the sitemap/robots functions that actually run per-request
// in the deployed serverless runtime, which is the case that needed it.)
let cachedSchools: School[] | null = null
let cachedAt = 0
const CACHE_TTL_MS = 60_000

export async function fetchAllSchools(): Promise<School[]> {
  const now = Date.now()
  if (cachedSchools && now - cachedAt < CACHE_TTL_MS) return cachedSchools

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await fetchAllRowsPaged<any>('schools', '*')
  if (!rows) return cachedSchools ?? localSchools

  cachedSchools = rows.map(mapRow)
  cachedAt = now
  return cachedSchools
}

// --- Server-side search/pagination -----------------------------------
// Used by the /schools page instead of fetchAllSchools() + client-side
// filtering — at 70,000+ rows, shipping the whole table to a mobile browser
// on every visit is not viable. Relies on the pg_trgm + B-tree indexes from
// scripts/add-search-indexes.sql for speed; still correct without them,
// just a full scan instead of an index scan.

export interface SchoolSearchParams {
  query?: string
  type?: string // 'all' | school_type
  subCity?: string // 'All Sub-cities' | sub_city
  feeMax?: number
  curriculum?: string // 'All Curricula' | curriculum substring
  page?: number
  pageSize?: number
}

function escapeIlike(s: string): string {
  return s.replace(/[%_,]/g, (c) => '\\' + c)
}

export async function searchSchools(params: SchoolSearchParams): Promise<{ schools: School[]; total: number }> {
  const { query, type, subCity, feeMax, curriculum, page = 1, pageSize = 15 } = params

  let q = supabase.from('schools').select('*', { count: 'exact' })

  if (query && query.trim()) {
    const esc = escapeIlike(query.trim())
    q = q.or(`name_en.ilike.%${esc}%,sub_city.ilike.%${esc}%,curriculum.ilike.%${esc}%`)
  }
  if (type && type !== 'all') {
    q = q.eq('school_type', type)
  }
  if (subCity && subCity !== 'All Sub-cities') {
    q = q.eq('sub_city', subCity)
  }
  if (typeof feeMax === 'number') {
    q = q.lte('fee_min', feeMax)
  }
  if (curriculum && curriculum !== 'All Curricula') {
    q = q.ilike('curriculum', `%${escapeIlike(curriculum.split(' ')[0])}%`)
  }

  q = q.order('verified', { ascending: false }).order('id', { ascending: true })

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  q = q.range(from, to)

  const { data, error, count } = await q
  if (error || !data) {
    console.log('searchSchools failed:', error?.message)
    return { schools: [], total: 0 }
  }
  return { schools: data.map(mapRow), total: count ?? data.length }
}

// Lightweight query for the autocomplete dropdown — name matches only, no count needed.
export async function searchSchoolSuggestions(query: string, limit = 7): Promise<School[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .ilike('name_en', `%${escapeIlike(q)}%`)
    .limit(limit)
  if (error || !data) return []
  return data.map(mapRow)
}

// Per-city counts for the location-filter sheet, via the school_city_counts
// view (see scripts/add-search-indexes.sql) — one small query instead of
// fetching every row to count them client-side.
export async function fetchCityCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('school_city_counts').select('sub_city, count')
  if (error || !data) {
    console.log('fetchCityCounts failed (has add-search-indexes.sql been run?):', error?.message)
    return {}
  }
  const map: Record<string, number> = {}
  for (const row of data as { sub_city: string; count: number }[]) {
    map[row.sub_city] = row.count
  }
  return map
}

// --- Minimal slug data, for the sitemap only ---------------------------
// The sitemap needs just id/name_en/sub_city to build a URL — fetching full
// rows (images, description, tags, etc.) for all 67,000+ schools on every
// request made the sitemap take 22+ seconds, slow enough that Google's
// crawler was timing out ("Couldn't fetch"). This is a much lighter query,
// with its own separate cache since it's shaped differently from School.

export interface SchoolSlugInfo {
  id: number
  name_en: string
  sub_city: string | null
}

// Just the row count — no data transfer at all. Used where only the total
// matters (e.g. robots.ts deciding how many sitemap chunks to list).
//
// Wrapped in unstable_cache rather than a plain module-level variable: on
// Vercel, each serverless invocation can land on a totally different,
// memory-isolated instance, so a `let cached = ...` variable provides no
// real caching in production at all (it only ever "worked" locally, where
// one long-running process served every test request). unstable_cache uses
// Next's actual persistent data cache, which Vercel backs with real
// infrastructure that survives across invocations — this is what made the
// sitemap/robots.txt take 22-28s on *every single request* in production,
// timing out Google's crawler, even after the payload-size fix.
export const fetchSchoolCount = unstable_cache(
  async (): Promise<number> => {
    const { count, error } = await supabase.from('schools').select('id', { count: 'exact', head: true })
    if (error || count === null) return 0
    return count
  },
  ['school-count'],
  { revalidate: 3600 }
)

// Its own unstable_cache (not derived from fetchAllSchools(), which uses a
// plain module-variable cache that only helps within a single build process
// — sitemap.ts runs per-request in the deployed serverless runtime, so it
// needs the persistent cache instead). Only sitemap.ts calls this — a
// handful of invocations per build/hour, not hundreds like the per-school
// pages, so it doesn't hit the worker contention that ruled out unstable_cache
// for fetchAllSchools() above.
export const fetchAllSchoolSlugs = unstable_cache(
  async (): Promise<SchoolSlugInfo[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await fetchAllRowsPaged<any>('schools', 'id, name_en, sub_city')
    return rows ?? []
  },
  ['school-slugs'],
  { revalidate: 3600 }
)

export async function fetchSchoolById(id: number): Promise<School | null> {
  const all = await fetchAllSchools()
  const found = all.find((s) => s.id === id)
  if (found) return found

  // Not in the cached batch (e.g. added after the cache was populated) — fetch directly.
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return localSchools.find((s) => s.id === id) ?? null
  }

  return mapRow(data)
}

export async function saveSchool(
  form: Omit<School, 'id' | 'fee_min' | 'fee_max' | 'source'>,
  existingId?: number
): Promise<{ id: number; error?: string }> {
  const images = form.images ?? []

  const payload = {
    name_en: form.name_en,
    name_am: form.name_am || null,
    school_type: form.school_type,
    curriculum: form.curriculum || null,
    grades: form.grades || null,
    language: form.language || null,
    sub_city: form.sub_city || null,
    woreda: form.woreda || null,
    latitude: form.latitude,
    longitude: form.longitude,
    fee_range_etb: form.fee_range_etb || null,
    fee_range_usd: form.fee_range_usd || null,
    fee_min: parseFeeMin(form.fee_range_etb ?? ''),
    fee_max: parseFeeMax(form.fee_range_etb ?? ''),
    phone: form.phone || null,
    email: form.email || null,
    website: form.website || null,
    description: form.description || null,
    established: form.established || null,
    verified: form.verified ?? false,
    coordinates_accuracy: form.coordinates_accuracy || 'low',
    tags: form.tags ?? [],
    images,
    image_url: images[0] ?? null,
  }

  if (existingId) {
    const { error } = await supabase.from('schools').update(payload).eq('id', existingId)
    if (error) return { id: existingId, error: error.message }
    await supabase.from('school_images').delete().eq('school_id', existingId)
    if (images.length > 0) {
      await supabase.from('school_images').insert(
        images.map((url, i) => ({ school_id: existingId, image_url: url, is_cover: i === 0, order_index: i }))
      )
    }
    return { id: existingId }
  } else {
    const { data, error } = await supabase.from('schools').insert(payload).select().single()
    if (error || !data) return { id: 0, error: error?.message ?? 'Insert failed' }
    if (images.length > 0) {
      await supabase.from('school_images').insert(
        images.map((url, i) => ({ school_id: data.id, image_url: url, is_cover: i === 0, order_index: i }))
      )
    }
    return { id: data.id }
  }
}

export async function deleteSchool(id: number): Promise<string | null> {
  const { error } = await supabase.from('schools').delete().eq('id', id)
  return error ? error.message : null
}
