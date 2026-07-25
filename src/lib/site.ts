export const SITE_URL = 'https://ethioschool.et'
export const SITE_NAME = 'EthioSchools'

// Generic classroom placeholder shown when a school has no uploaded photo yet.
// Not stored in the database — purely a UI fallback, so it never gets
// mistaken for a verified photo of a specific school.
export const DEFAULT_SCHOOL_IMAGE =
  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80&auto=format&fit=crop'

// Same idea, for universities without an uploaded photo.
export const DEFAULT_UNIVERSITY_IMAGE =
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80&auto=format&fit=crop'

/** URL-safe slug from any text (Amharic/unicode chars are dropped). */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Canonical slug for a school: name + sub-city + id, e.g. "sandford-international-school-bole-247" */
export function schoolSlug(s: { id: number; name_en: string; sub_city?: string | null }): string {
  const base = slugify([s.name_en, s.sub_city].filter(Boolean).join(' '))
  return base ? `${base}-${s.id}` : String(s.id)
}

export function schoolPath(s: { id: number; name_en: string; sub_city?: string | null }): string {
  return `/schools/${schoolSlug(s)}`
}

/** Canonical slug for a university: name + city + id */
export function universitySlug(u: { id: number; name_en: string; city?: string | null }): string {
  const base = slugify([u.name_en, u.city].filter(Boolean).join(' '))
  return base ? `${base}-${u.id}` : String(u.id)
}

export function universityPath(u: { id: number; name_en: string; city?: string | null }): string {
  return `/universities/${universitySlug(u)}`
}

/** Extract the numeric id from a slug ("sandford-...-247" → 247, "247" → 247). */
export function idFromSlug(slug: string): number {
  const m = decodeURIComponent(slug).match(/(\d+)$/)
  return m ? Number(m[1]) : NaN
}

export function citySlug(city: string): string {
  return slugify(city)
}
