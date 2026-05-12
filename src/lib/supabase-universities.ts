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

export async function fetchAllUniversities(): Promise<University[]> {
  const { data, error } = await supabase
    .from('universities')
    .select('*')
    .order('id')

  if (error || !data || data.length === 0) {
    console.log('Supabase universities fetch failed, using local data:', error?.message)
    return localUniversities
  }

  return data.map(mapRow)
}

export async function fetchUniversityById(id: number): Promise<University | null> {
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
