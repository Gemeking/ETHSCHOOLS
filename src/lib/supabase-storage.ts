import { supabase } from './supabase'

export const STORAGE_BUCKET = 'images'

export async function uploadImage(
  file: File,
  folder: 'schools' | 'universities'
): Promise<{ url: string | null; error?: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const randomId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const path = `${folder}/${randomId}.${ext}`

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
      contentType: file.type,
    })

  if (error) {
    if (error.message.includes('bucket') || error.message.includes('not found')) {
      return {
        url: null,
        error: 'Storage bucket not set up. Run the SQL in scripts/create-storage-bucket.sql in your Supabase dashboard first.',
      }
    }
    return { url: null, error: error.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path)

  return { url: publicUrl }
}

export async function deleteStorageImage(url: string): Promise<void> {
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return
  const path = decodeURIComponent(url.slice(idx + marker.length))
  await supabase.storage.from(STORAGE_BUCKET).remove([path])
}
