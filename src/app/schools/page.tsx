'use client'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, Map, Grid3X3, ChevronDown } from 'lucide-react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SchoolCard from '@/components/SchoolCard'
import { schools as localSchools } from '@/lib/data'
import { fetchAllSchools } from '@/lib/supabase-data'
import { SUB_CITIES, CURRICULA, typeLabel } from '@/lib/utils'
import type { SchoolType, School } from '@/lib/types'

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false, loading: () => <div className="h-full bg-slate-200 animate-pulse rounded-xl" /> })

const TYPES: SchoolType[] = ['all', 'international', 'private', 'public']
const MAX_FEE = 750000

export default function SchoolsPage() {
  const params = useSearchParams()

  const [allSchools, setAllSchools] = useState<School[]>(localSchools)
  const [query, setQuery] = useState(params.get('q') || '')
  const [type, setType] = useState<SchoolType>((params.get('type') as SchoolType) || 'all')
  const [subCity, setSubCity] = useState(params.get('city') || 'All Sub-cities')
  const [feeMax, setFeeMax] = useState(MAX_FEE)
  const [curriculum, setCurriculum] = useState('All Curricula')
  const [view, setView] = useState<'grid' | 'map'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    fetchAllSchools().then(setAllSchools)
  }, [])

  useEffect(() => {
    if (params.get('q')) setQuery(params.get('q')!)
    if (params.get('type')) setType(params.get('type') as SchoolType)
    if (params.get('city')) setSubCity(params.get('city')!)
  }, [params])

  const filtered = useMemo(() => {
    return allSchools.filter((s) => {
      if (query) {
        const q = query.toLowerCase()
        if (!s.name_en.toLowerCase().includes(q) && !s.sub_city.toLowerCase().includes(q) && !s.curriculum.toLowerCase().includes(q)) return false
      }
      if (type !== 'all' && s.school_type !== type) return false
      if (subCity !== 'All Sub-cities' && s.sub_city !== subCity) return false
      if (s.fee_min > feeMax) return false
      if (curriculum !== 'All Curricula' && !s.curriculum.toLowerCase().includes(curriculum.split(' ')[0].toLowerCase())) return false
      return true
    })
  }, [allSchools, query, type, subCity, feeMax, curriculum])

  const hasFilters = query || type !== 'all' || subCity !== 'All Sub-cities' || feeMax < MAX_FEE || curriculum !== 'All Curricula'

  function clearFilters() {
    setQuery(''); setType('all'); setSubCity('All Sub-cities')
    setFeeMax(MAX_FEE); setCurriculum('All Curricula')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Schools in Addis Ababa</h1>

          {/* Search + controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search school name, area, curriculum..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-slate-50"
              />
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 bg-white sm:hidden"
            >
              <SlidersHorizontal size={15} /> Filters {hasFilters && <span className="w-2 h-2 rounded-full bg-primary-500" />}
            </button>
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
              <button onClick={() => setView('grid')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'grid' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                <Grid3X3 size={14} /> Grid
              </button>
              <button onClick={() => setView('map')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'map' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                <Map size={14} /> Map
              </button>
            </div>
          </div>

          {/* Type filter tabs */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${type === t ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'}`}
              >
                {typeLabel(t)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6 w-full flex-1">
        {/* ── SIDEBAR FILTERS ── */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} sm:block w-full sm:w-64 shrink-0 space-y-5`}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-20 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2"><SlidersHorizontal size={15} /> Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                  <X size={12} /> Clear all
                </button>
              )}
            </div>

            {/* Sub-city */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Sub-city</label>
              <div className="relative">
                <select
                  value={subCity}
                  onChange={(e) => setSubCity(e.target.value)}
                  className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                >
                  {SUB_CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Curriculum</label>
              <div className="relative">
                <select
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value)}
                  className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                >
                  {CURRICULA.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Max fee */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                Max Annual Fee
              </label>
              <div className="text-sm font-semibold text-primary-600 mb-2">
                {feeMax >= MAX_FEE ? 'Any price' : `Up to ${feeMax.toLocaleString()} ETB`}
              </div>
              <input
                type="range"
                min={0}
                max={MAX_FEE}
                step={10000}
                value={feeMax}
                onChange={(e) => setFeeMax(Number(e.target.value))}
                className="w-full accent-primary-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Free</span><span>750,000 ETB</span>
              </div>
            </div>

            {/* Active filter summary */}
            {hasFilters && (
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {allSchools.length} schools
              </div>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0">
          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{filtered.length}</span> school{filtered.length !== 1 ? 's' : ''} found
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                <X size={12} /> Clear filters
              </button>
            )}
          </div>

          {view === 'grid' ? (
            <>
              {filtered.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <Search size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No schools found</p>
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                  <button onClick={clearFilters} className="mt-4 text-primary-600 text-sm font-medium hover:underline">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.map((school) => (
                    <SchoolCard key={school.id} school={school} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="h-[calc(100vh-280px)] min-h-[500px]">
              <MapComponent schools={filtered} height="100%" />
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}
