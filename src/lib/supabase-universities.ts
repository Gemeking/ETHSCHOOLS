import { supabase } from './supabase'
import { universities as localUniversities } from './university-data'
import type { University } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(u: any): University {
  const images: string[] = Array.isArray(u.images) ? u.images : u.image_url ? [u.image_url] : []
  return {
    ...(u as University),
    images,
    image_url: images[0] ?? null,
    tags: Array.isArray(u.tags) ? (u.tags as string[]) : [],
    departments: Array.isArray(u.departments) ? u.departments : [],
  }
}

// PostgREST caps any single request at 1,000 rows regardless of table size —
// silently, no error. Paginated the same way as fetchAllSchools() so this
// keeps working correctly if this table ever grows past that.
const FETCH_PAGE_SIZE = 1000

// Plain module-level cache — correct here because every caller runs during
// `next build`, a single process (see the matching comment in
// supabase-data.ts for why unstable_cache was tried and reverted).
let cachedUniversities: University[] | null = null
let cachedAt = 0
const CACHE_TTL_MS = 60_000

export async function fetchAllUniversities(): Promise<University[]> {
  const now = Date.now()
  if (cachedUniversities && now - cachedAt < CACHE_TTL_MS) return cachedUniversities

  const { count, error: countError } = await supabase
    .from('universities')
    .select('id', { count: 'exact', head: true })

  if (countError || count === null) {
    console.log('Supabase universities count failed:', countError?.message)
    return cachedUniversities ?? localUniversities
  }

  const pageCount = Math.max(1, Math.ceil(count / FETCH_PAGE_SIZE))
  const pages = await Promise.all(
    Array.from({ length: pageCount }, (_, i) => {
      const from = i * FETCH_PAGE_SIZE
      const to = from + FETCH_PAGE_SIZE - 1
      return supabase.from('universities').select('*').order('id').range(from, to)
    })
  )

  const failed = pages.find((p) => p.error)
  if (failed?.error || pages.some((p) => !p.data)) {
    console.log('Supabase universities fetch failed:', failed?.error?.message)
    return cachedUniversities ?? localUniversities
  }

  cachedUniversities = pages.flatMap((p) => p.data!.map(mapRow))
  cachedAt = now
  return cachedUniversities
}

export async function fetchUniversityById(id: number): Promise<University | null> {
  const all = await fetchAllUniversities()
  const found = all.find((u) => u.id === id)
  if (found) return found

  const { data, error } = await supabase
    .from('universities')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return localUniversities.find((u) => u.id === id) ?? null
  }

  return mapRow(data)
}

export async function saveUniversity(
  form: Omit<University, 'id'>,
  existingId?: number
): Promise<{ id: number; error?: string }> {
  const images = form.images ?? []

  const payload = {
    name_en: form.name_en,
    name_am: form.name_am || null,
    university_type: form.university_type,
    city: form.city || null,
    region: form.region || null,
    latitude: form.latitude,
    longitude: form.longitude,
    established: form.established || null,
    description: form.description || null,
    phone: form.phone || null,
    email: form.email || null,
    website: form.website || null,
    departments: form.departments ?? [],
    images,
    image_url: images[0] ?? null,
    tags: form.tags ?? [],
    verified: form.verified ?? false,
    student_count: form.student_count || null,
    fee_range_etb: form.fee_range_etb || null,
  }

  if (existingId) {
    const { error } = await supabase.from('universities').update(payload).eq('id', existingId)
    if (error) return { id: existingId, error: error.message }
    return { id: existingId }
  } else {
    const { data, error } = await supabase.from('universities').insert(payload).select().single()
    if (error || !data) return { id: 0, error: error?.message ?? 'Insert failed' }
    return { id: data.id }
  }
}

export async function deleteUniversity(id: number): Promise<string | null> {
  const { error } = await supabase.from('universities').delete().eq('id', id)
  return error ? error.message : null
}
