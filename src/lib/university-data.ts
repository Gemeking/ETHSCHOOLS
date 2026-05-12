import rawData from '../../data/universities_ethiopia.json'
import type { University } from './types'

export const universities: University[] = rawData.map((u) => ({
  ...u,
  university_type: u.university_type as University['university_type'],
  departments: u.departments ?? [],
  images: u.images ?? [],
  image_url: u.image_url ?? null,
  tags: u.tags ?? [],
  phone: u.phone ?? null,
  email: u.email ?? null,
  website: u.website ?? null,
  student_count: u.student_count ?? null,
  fee_range_etb: u.fee_range_etb ?? null,
  established: u.established ?? null,
}))

export function getUniversityById(id: number): University | null {
  return universities.find((u) => u.id === id) ?? null
}

export const universityStats = {
  total: universities.length,
  public: universities.filter((u) => u.university_type === 'public').length,
  private: universities.filter((u) => u.university_type === 'private').length,
  faith_based: universities.filter((u) => u.university_type === 'faith_based').length,
  regions: new Set(universities.map((u) => u.region)).size,
}
