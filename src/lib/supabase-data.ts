import { supabase } from './supabase'
import { schools as localSchools } from './data'
import type { School } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(s: any, images: { image_url: string }[] = []): School {
  return {
    ...(s as School),
    images: images.map((img) => img.image_url),
    tags: Array.isArray(s.tags) ? (s.tags as string[]) : [],
  }
}

export async function fetchAllSchools(): Promise<School[]> {
  const { data, error } = await supabase
    .from('schools')
    .select('*, school_images(image_url, is_cover, order_index)')
    .order('id')

  if (error || !data || data.length === 0) return localSchools

  return data.map((s) => mapRow(s, s.school_images ?? []))
}

export async function fetchSchoolById(id: number): Promise<School | null> {
  const { data, error } = await supabase
    .from('schools')
    .select('*, school_images(image_url, is_cover, order_index)')
    .eq('id', id)
    .single()

  if (error || !data) return localSchools.find((s) => s.id === id) ?? null

  return mapRow(data, data.school_images ?? [])
}

export async function saveSchool(
  form: Omit<School, 'id' | 'fee_min' | 'fee_max' | 'source'>,
  existingId?: number
): Promise<{ id: number; error?: string }> {
  const payload = {
    name_en: form.name_en,
    name_am: form.name_am,
    school_type: form.school_type,
    curriculum: form.curriculum,
    grades: form.grades,
    language: form.language,
    sub_city: form.sub_city,
    woreda: form.woreda,
    latitude: form.latitude,
    longitude: form.longitude,
    fee_range_etb: form.fee_range_etb,
    fee_range_usd: form.fee_range_usd,
    fee_min: parseFeeMin(form.fee_range_etb),
    fee_max: parseFeeMax(form.fee_range_etb),
    phone: form.phone || null,
    email: form.email || null,
    website: form.website || null,
    description: form.description,
    established: form.established,
    verified: form.verified,
    coordinates_accuracy: form.coordinates_accuracy,
    tags: form.tags ?? [],
  }

  let schoolId = existingId

  if (existingId) {
    const { error } = await supabase.from('schools').update(payload).eq('id', existingId)
    if (error) return { id: existingId, error: error.message }
  } else {
    const { data, error } = await supabase.from('schools').insert(payload).select().single()
    if (error || !data) return { id: 0, error: error?.message ?? 'Insert failed' }
    schoolId = data.id
  }

  if (schoolId) {
    await supabase.from('school_images').delete().eq('school_id', schoolId)
    const imgs = (form.images ?? [])
    if (imgs.length > 0) {
      await supabase.from('school_images').insert(
        imgs.map((url, i) => ({
          school_id: schoolId,
          image_url: url,
          is_cover: i === 0,
          order_index: i,
        }))
      )
    }
  }

  return { id: schoolId ?? 0 }
}

export async function deleteSchool(id: number): Promise<string | null> {
  const { error } = await supabase.from('schools').delete().eq('id', id)
  return error ? error.message : null
}

function parseFeeMin(feeEtb: string): number {
  if (!feeEtb || feeEtb.toLowerCase().includes('free')) return 0
  const match = feeEtb.replace(/,/g, '').match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

function parseFeeMax(feeEtb: string): number {
  if (!feeEtb || feeEtb.toLowerCase().includes('free')) return 0
  const nums = feeEtb.replace(/,/g, '').match(/\d+/g)
  return nums ? parseInt(nums[nums.length - 1]) : 0
}
