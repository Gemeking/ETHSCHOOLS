import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { School } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function typeColor(type: School['school_type']) {
  return {
    international: 'bg-violet-100 text-violet-700 border-violet-200',
    private: 'bg-blue-100 text-blue-700 border-blue-200',
    public: 'bg-green-100 text-green-700 border-green-200',
  }[type]
}

export function typeGradient(type: School['school_type']) {
  return {
    international: 'from-violet-600 to-indigo-700',
    private: 'from-blue-600 to-cyan-700',
    public: 'from-green-600 to-emerald-700',
  }[type]
}

export function typeLabel(type: School['school_type'] | 'all') {
  return {
    all: 'All Schools',
    international: 'International',
    private: 'Private',
    public: 'Public',
  }[type]
}

export function parseFeeMin(feeEtb: string | null | undefined): number {
  if (!feeEtb) return 0
  if (feeEtb.toLowerCase().includes('free')) return 0
  const match = feeEtb.replace(/,/g, '').match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

export function parseFeeMax(feeEtb: string | null | undefined): number {
  if (!feeEtb) return 0
  if (feeEtb.toLowerCase().includes('free')) return 0
  const nums = feeEtb.replace(/,/g, '').match(/\d+/g)
  return nums ? parseInt(nums[nums.length - 1]) : 0
}

export function formatFee(feeEtb: string | null | undefined): string {
  if (!feeEtb) return 'Contact school'
  if (feeEtb.toLowerCase().includes('free')) return 'Free'
  return `${feeEtb} ETB/yr`
}

export const SUB_CITIES = [
  'All Sub-cities',
  'Addis Ketema',
  'Akaki Kaliti',
  'Arada',
  'Bole',
  'Gulele',
  'Kirkos',
  'Kolfe Keranio',
  'Lideta',
  'Nifas Silk-Lafto',
  'Yeka',
]

export const CURRICULA = [
  'All Curricula',
  'Ethiopian',
  'IB (International Baccalaureate)',
  'American (AP)',
  'British (Cambridge)',
  'French (Baccalauréat)',
  'German (Abitur)',
]
