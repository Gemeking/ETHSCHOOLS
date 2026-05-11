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

export async function fetchAllSchools(): Promise<School[]> {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .order('id')

  if (error || !data || data.length === 0) {
    console.log('Supabase fetch failed, using local data:', error?.message)
    return localSchools
  }

  return data.map(mapRow)
}

export async function fetchSchoolById(id: number): Promise<School | null> {
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
