'use client'
import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Globe, Lock, Building2, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { schools } from '@/lib/data'
import type { SchoolType } from '@/lib/types'
import { typeLabel } from '@/lib/utils'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-slate-200 animate-pulse flex items-center justify-center">
      <p className="text-slate-500">Loading map...</p>
    </div>
  ),
})

const TYPES: { value: SchoolType; icon: React.ElementType; color: string }[] = [
  { value: 'all', icon: Building2, color: 'bg-slate-600 text-white' },
  { value: 'international', icon: Globe, color: 'bg-violet-600 text-white' },
  { value: 'private', icon: Lock, color: 'bg-blue-600 text-white' },
  { value: 'public', icon: Building2, color: 'bg-green-600 text-white' },
]

export default function MapPage() {
  const [type, setType] = useState<SchoolType>('all')
  const [subCity, setSubCity] = useState('All')

  const subCities = ['All', ...Array.from(new Set(schools.map((s) => s.sub_city))).sort()]

  const filtered = useMemo(() => {
    return schools.filter((s) => {
      if (type !== 'all' && s.school_type !== type) return false
      if (subCity !== 'All' && s.sub_city !== subCity) return false
      return true
    })
  }, [type, subCity])

  return (
    <div className="h-screen flex flex-col">
      <Navbar />

      {/* Controls bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-slate-500">Filter:</span>

          {/* Type filters */}
          <div className="flex gap-1.5">
            {TYPES.map(({ value, icon: Icon, color }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  type === value ? color : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <Icon size={12} /> {typeLabel(value)}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-slate-200" />

          {/* Sub-city filter */}
          <div className="flex gap-1.5 flex-wrap">
            {subCities.map((c) => (
              <button
                key={c}
                onClick={() => setSubCity(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  subCity === c
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="ml-auto text-xs text-slate-500 font-medium">
            {filtered.length} school{filtered.length !== 1 ? 's' : ''} shown
          </div>

          {(type !== 'all' || subCity !== 'All') && (
            <button
              onClick={() => { setType('all'); setSubCity('All') }}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-4 z-10 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-slate-200 p-3 text-xs space-y-1.5">
        <div className="font-semibold text-slate-700 mb-2">Legend</div>
        {[
          { label: 'International', color: '#7c3aed' },
          { label: 'Private', color: '#1d4ed8' },
          { label: 'Public', color: '#15803d' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="text-slate-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Full-screen map */}
      <div className="flex-1 relative">
        <MapComponent schools={filtered} height="100%" zoom={12} />
      </div>
    </div>
  )
}
