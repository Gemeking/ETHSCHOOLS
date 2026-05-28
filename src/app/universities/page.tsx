'use client'
import { useState, useMemo, useEffect } from 'react'
import { Search, SlidersHorizontal, X, GraduationCap, ChevronDown, BookOpen } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import UniversityCard from '@/components/UniversityCard'
import Pagination from '@/components/Pagination'
import { universities as localUniversities } from '@/lib/university-data'
import { fetchAllUniversities } from '@/lib/supabase-universities'
import { ETHIOPIA_REGIONS } from '@/lib/types'
import type { University, UniversityType } from '@/lib/types'

const PAGE_SIZE = 15

function sanitize(val: string) {
  return val.replace(/[<>"'`;]/g, '').slice(0, 100)
}

const TYPES: { value: UniversityType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'faith_based', label: 'Faith-Based' },
]

export default function UniversitiesPage() {
  const [allUniversities, setAllUniversities] = useState<University[]>(localUniversities)
  const [query, setQuery] = useState('')
  const [type, setType] = useState<UniversityType>('all')
  const [region, setRegion] = useState('All Regions')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchAllUniversities().then(setAllUniversities)
  }, [])

  const filtered = useMemo(() => {
    return allUniversities.filter((u) => {
      if (query) {
        const q = query.toLowerCase()
        if (
          !u.name_en.toLowerCase().includes(q) &&
          !u.city.toLowerCase().includes(q) &&
          !u.region.toLowerCase().includes(q) &&
          !u.departments.some((d) => d.name.toLowerCase().includes(q) || d.programs.some((p) => p.toLowerCase().includes(q)))
        ) return false
      }
      if (type !== 'all' && u.university_type !== type) return false
      if (region !== 'All Regions' && u.region !== region) return false
      return true
    }).sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0))
  }, [allUniversities, query, type, region])

  const hasFilters = query || type !== 'all' || region !== 'All Regions'

  useEffect(() => { setPage(1) }, [query, type, region])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function clearFilters() {
    setQuery(''); setType('all'); setRegion('All Regions')
  }

  const totalPrograms = allUniversities.reduce(
    (sum, u) => sum + u.departments.reduce((s, d) => s + d.programs.length, 0),
    0
  )

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-4">
            <GraduationCap size={14} className="text-emerald-400" />
            <span className="text-slate-300">Higher Education in Ethiopia</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Ethiopian Universities</h1>
          <p className="text-slate-300 mb-6 max-w-xl mx-auto">
            Browse {allUniversities.length} universities across all regions of Ethiopia.
            Explore {totalPrograms}+ programs from engineering to medicine.
          </p>

          <div className="max-w-xl mx-auto flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(sanitize(e.target.value))}
                placeholder="Search university, city, program..."
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 backdrop-blur"
              />
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-sm font-medium hover:bg-white/20 sm:hidden"
            >
              <SlidersHorizontal size={15} />
            </button>
          </div>

          {/* Type tabs */}
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            {TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  type === value
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6 w-full flex-1">

        {/* Sidebar */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} sm:block w-full sm:w-64 shrink-0`}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-20 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal size={15} /> Filters
              </h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            {/* Region filter */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Region</label>
              <div className="relative">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white"
                >
                  {ETHIOPIA_REGIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Stats */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Summary</div>
              {[
                { label: 'Public', count: allUniversities.filter((u) => u.university_type === 'public').length, color: 'bg-emerald-500' },
                { label: 'Private', count: allUniversities.filter((u) => u.university_type === 'private').length, color: 'bg-blue-500' },
                { label: 'Faith-Based', count: allUniversities.filter((u) => u.university_type === 'faith_based').length, color: 'bg-amber-500' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-slate-600">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span>{label}</span>
                  <span className="ml-auto font-semibold text-slate-800">{count}</span>
                </div>
              ))}
            </div>

            {hasFilters && (
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {allUniversities.length} universities
              </div>
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{filtered.length}</span> {filtered.length !== 1 ? 'universities' : 'university'} found
              {totalPages > 1 && (
                <span className="ml-1 text-slate-400">· page {page} of {totalPages}</span>
              )}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                <X size={12} /> Clear filters
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No universities found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
              <button onClick={clearFilters} className="mt-4 text-primary-600 text-sm font-medium hover:underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paged.map((university) => (
                  <UniversityCard key={university.id} university={university} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                total={filtered.length}
                pageSize={PAGE_SIZE}
                onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              />
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}
