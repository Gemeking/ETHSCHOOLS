import rawSchools from '../../data/schools_addis_ababa.json'
import type { School } from './types'
import { parseFeeMin, parseFeeMax } from './utils'

export const schools: School[] = (rawSchools as Omit<School, 'fee_min' | 'fee_max' | 'images'>[]).map((s) => ({
  ...s,
  fee_min: parseFeeMin(s.fee_range_etb),
  fee_max: parseFeeMax(s.fee_range_etb),
  images: s.image_url ? [s.image_url] : [],
}))

export function getSchoolById(id: number): School | undefined {
  return schools.find((s) => s.id === id)
}

export function getSchools({
  query = '',
  type = 'all',
  sub_city = '',
  fee_max = 999999,
  curriculum = '',
  language = '',
}: {
  query?: string
  type?: string
  sub_city?: string
  fee_max?: number
  curriculum?: string
  language?: string
} = {}): School[] {
  return schools.filter((s) => {
    if (query) {
      const q = query.toLowerCase()
      if (
        !s.name_en.toLowerCase().includes(q) &&
        !s.name_am?.includes(q) &&
        !s.description?.toLowerCase().includes(q) &&
        !s.sub_city?.toLowerCase().includes(q)
      ) return false
    }
    if (type && type !== 'all' && s.school_type !== type) return false
    if (sub_city && sub_city !== 'All Sub-cities' && s.sub_city !== sub_city) return false
    if (fee_max < 999999 && s.fee_min > fee_max) return false
    if (curriculum && curriculum !== 'All Curricula' && !s.curriculum?.includes(curriculum.split(' ')[0])) return false
    if (language && !s.language?.toLowerCase().includes(language.toLowerCase())) return false
    return true
  })
}

export const stats = {
  total: schools.length,
  international: schools.filter((s) => s.school_type === 'international').length,
  private: schools.filter((s) => s.school_type === 'private').length,
  public: schools.filter((s) => s.school_type === 'public').length,
  subCities: [...new Set(schools.map((s) => s.sub_city))].length,
}
