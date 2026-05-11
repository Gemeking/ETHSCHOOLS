export interface School {
  id: number
  name_en: string
  name_am: string
  school_type: 'international' | 'private' | 'public'
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

export type SchoolType = 'all' | 'international' | 'private' | 'public'

export interface FilterState {
  query: string
  type: SchoolType
  sub_city: string
  fee_max: number
  curriculum: string
  language: string
}
