export interface School {
  id: number
  name_en: string
  name_am: string
  school_type: 'international' | 'private' | 'public' | 'tvet'
  curriculum: string
  grades: string
  language: string
  sub_city: string
  woreda: string
  latitude: number
  longitude: number
  fee_range_etb: string
  fee_range_usd: string
  fee_min: number
  fee_max: number
  phone: string | null
  email: string | null
  website: string | null
  description: string
  established: number
  verified: boolean
  coordinates_accuracy: 'high' | 'medium' | 'low'
  source: string
  image_url: string | null
  images: string[]
  tags: string[]
}

export type SchoolType = 'all' | 'international' | 'private' | 'public' | 'tvet'

export interface FilterState {
  query: string
  type: SchoolType
  sub_city: string
  fee_max: number
  curriculum: string
  language: string
}

export interface Department {
  name: string
  programs: string[]
}

export interface University {
  id: number
  name_en: string
  name_am: string
  university_type: 'public' | 'private' | 'faith_based'
  city: string
  region: string
  latitude: number
  longitude: number
  established: number | null
  description: string
  phone: string | null
  email: string | null
  website: string | null
  departments: Department[]
  images: string[]
  image_url: string | null
  tags: string[]
  verified: boolean
  student_count: string | null
  fee_range_etb: string | null
}

export type UniversityType = 'all' | 'public' | 'private' | 'faith_based'

export const ETHIOPIA_REGIONS = [
  'All Regions',
  'Addis Ababa',
  'Oromia',
  'Amhara',
  'Tigray',
  'SNNPR',
  'Sidama',
  'Somali',
  'Afar',
  'Benishangul-Gumuz',
  'Gambella',
  'Harari',
  'Dire Dawa',
] as const
