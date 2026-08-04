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

// In-memory cache so hundreds of static school pages built in the same
// process (e.g. a Vercel build worker) share one Supabase round-trip instead
// of each page re-fetching the whole table — this is what was blowing past
// Vercel's 60s-per-page static generation timeout once the catalog passed ~700 schools.
let cachedSchools: School[] | null = null
let cachedAt = 0
const CACHE_TTL_MS = 60_000

export async function fetchAllSchools(): Promise<School[]> {
  const now = Date.now()
  if (cachedSchools && now - cachedAt < CACHE_TTL_MS) return cachedSchools

  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .order('id')

  if (error || !data || data.length === 0) {
    console.log('Supabase fetch failed, using local data:', error?.message)
    return cachedSchools ?? localSchools
  }

  cachedSchools = data.map(mapRow)
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
