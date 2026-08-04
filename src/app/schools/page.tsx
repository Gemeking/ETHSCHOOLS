'use client'
import { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Search, SlidersHorizontal, X, Map, Grid3X3,
  ChevronDown, MapPin, ArrowRight, Check,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SchoolCard from '@/components/SchoolCard'
import Pagination from '@/components/Pagination'
import { searchSchools, searchSchoolSuggestions, fetchCityCounts } from '@/lib/supabase-data'
import { CURRICULA, typeLabel } from '@/lib/utils'
import type { SchoolType, School } from '@/lib/types'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full bg-slate-200 animate-pulse rounded-2xl" />,
})

const TYPES: SchoolType[] = ['all', 'international', 'private', 'public', 'tvet']
const MAX_FEE = 2_000_000
const PAGE_SIZE = 15

function sanitize(val: string) {
  return val.replace(/[<>"'`;]/g, '').slice(0, 100)
}

const REGION_GROUPS: { region: string; emoji: string; cities: string[] }[] = [
  { region: 'Addis Ababa', emoji: '🏙️', cities: ['Addis Ketema', 'Akaki Kaliti', 'Arada', 'Bole', 'Gulele', 'Kirkos', 'Kolfe Keranio', 'Lideta', 'Nifas Silk-Lafto', 'Yeka'] },
  { region: 'Sheger City', emoji: '🌆', cities: ['Burayu', 'Sebeta', 'Sululta', 'Legetafo', 'Gelan'] },
  { region: 'Amhara',      emoji: '🏔️', cities: ['Bahir Dar', 'Gondar', 'Dessie', 'Debre Markos', 'Debre Birhan', 'Kombolcha', 'Woldia', 'Debre Tabor', 'Lalibela', 'Finote Selam', 'Injibara', 'Sekota'] },
  { region: 'Oromia',      emoji: '🌿', cities: ['Adama', 'Bishoftu', 'Holeta', 'Jimma', 'Nekemte', 'Ambo', 'Woliso', 'Asella', 'Shashamane', 'Ziway', 'Shambu', 'Metu', 'Moyale', 'Yabelo', 'Chiro', 'Dodola', 'Tepi', 'Fitche'] },
  { region: 'Sidama',      emoji: '🦩', cities: ['Hawassa'] },
  { region: 'SNNPR',       emoji: '🌄', cities: ['Arba Minch', 'Wolkite', 'Hosaena', 'Wolaita Sodo', 'Bonga', 'Jinka'] },
  { region: 'Tigray',      emoji: '🏛️', cities: ['Mekelle', 'Adigrat', 'Axum', 'Shire', 'Abiy Adi'] },
  { region: 'Dire Dawa',   emoji: '🚂', cities: ['Dire Dawa'] },
  { region: 'Harari',      emoji: '🕌', cities: ['Harar'] },
  { region: 'Somali',      emoji: '🐪', cities: ['Jijiga', 'Gode'] },
  { region: 'Afar',        emoji: '🏜️', cities: ['Asaita'] },
  { region: 'Benishangul-Gumuz', emoji: '🌳', cities: ['Assosa'] },
]

const CITY_META: Record<string, { emoji: string }> = {
  'Bole':             { emoji: '✈️' },
  'Yeka':             { emoji: '🏔️' },
  'Kirkos':           { emoji: '🏛️' },
  'Arada':            { emoji: '🏙️' },
  'Nifas Silk-Lafto': { emoji: '🌿' },
  'Nefas Silk-Lafto': { emoji: '🌿' },
  'Kolfe Keranio':    { emoji: '🏠' },
  'Addis Ketema':     { emoji: '🌆' },
  'Lideta':           { emoji: '🎓' },
  'Gulele':           { emoji: '🌳' },
  'Akaki Kaliti':     { emoji: '🏭' },
  'Burayu':           { emoji: '🏡' },
  'Sebeta':           { emoji: '🛣️' },
  'Sululta':          { emoji: '🌾' },
  'Legetafo':         { emoji: '🌲' },
  'Gelan':            { emoji: '🏘️' },
  'Bahir Dar':        { emoji: '🌊' },
  'Gondar':           { emoji: '🏰' },
  'Dessie':           { emoji: '⛰️' },
  'Debre Markos':     { emoji: '🌄' },
  'Debre Birhan':     { emoji: '💡' },
  'Kombolcha':        { emoji: '🏭' },
  'Woldia':           { emoji: '🏞️' },
  'Debre Tabor':      { emoji: '🕌' },
  'Lalibela':         { emoji: '⛪' },
  'Finote Selam':     { emoji: '🌿' },
  'Adama':            { emoji: '🏙️' },
  'Bishoftu':         { emoji: '💧' },
  'Jimma':            { emoji: '☕' },
  'Nekemte':          { emoji: '🌻' },
  'Ambo':             { emoji: '💦' },
  'Woliso':           { emoji: '🌾' },
  'Asella':           { emoji: '🏃' },
  'Shashamane':       { emoji: '🛤️' },
  'Hawassa':          { emoji: '🦩' },
  'Dire Dawa':        { emoji: '🚂' },
  'Harar':            { emoji: '🕌' },
  'Ziway':            { emoji: '🐟' },
  'Shambu':           { emoji: '🌳' },
  'Metu':             { emoji: '🌲' },
  'Moyale':           { emoji: '🛂' },
  'Yabelo':           { emoji: '🦒' },
  'Holeta':           { emoji: '🏘️' },
  'Chiro':            { emoji: '🌵' },
  'Dodola':           { emoji: '🏔️' },
  'Tepi':             { emoji: '🍵' },
  'Arba Minch':       { emoji: '💧' },
  'Mekelle':          { emoji: '🏛️' },
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold text-indigo-700 bg-indigo-50 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  )
}

export default function SchoolsPage() {
  return (
    <Suspense fallback={<SchoolsPageSkeleton />}>
      <SchoolsPageContent />
    </Suspense>
  )
}

function SchoolsPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f2f5ff' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="h-12 bg-white rounded-2xl border border-slate-100 mb-5 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-72 bg-white rounded-2xl border border-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}

function SchoolsPageContent() {
  const params = useSearchParams()

  const [query, setQuery]           = useState(params.get('q') || '')
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [type, setType]             = useState<SchoolType>((params.get('type') as SchoolType) || 'all')
  const [subCity, setSubCity]       = useState(params.get('city') || 'All Sub-cities')
  const [feeMax, setFeeMax]         = useState(MAX_FEE)
  const [curriculum, setCurriculum] = useState('All Curricula')
  const [view, setView]             = useState<'grid' | 'map'>('grid')
  const [page, setPage]             = useState(1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIdx, setActiveIdx]   = useState(-1)
  const [sheetOpen, setSheetOpen]         = useState(false)
  const [sheetTab, setSheetTab]           = useState<'location' | 'more'>('location')
  const [locationQuery, setLocationQuery] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)

  const [results, setResults] = useState<School[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [mapSchools, setMapSchools] = useState<School[]>([])
  const [suggestions, setSuggestions] = useState<School[]>([])
  const [cityCounts, setCityCounts] = useState<Record<string, number>>({})

  // Debounce the search box so typing doesn't fire a query every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (params.get('q'))    setQuery(params.get('q')!)
    if (params.get('type')) setType(params.get('type') as SchoolType)
    if (params.get('city')) setSubCity(params.get('city')!)
  }, [params])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false); setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Lock background scroll while the filter sheet is open (mobile-friendly)
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sheetOpen])

  // City counts for the location sheet — fetched once, not per keystroke.
  useEffect(() => { fetchCityCounts().then(setCityCounts) }, [])

  // Live autocomplete — small, separate, debounced query.
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setSuggestions([]); return }
    let cancelled = false
    const t = setTimeout(() => {
      searchSchoolSuggestions(q).then((s) => { if (!cancelled) setSuggestions(s) })
    }, 200)
    return () => { cancelled = true; clearTimeout(t) }
  }, [query])

  const moreFiltersActive = subCity !== 'All Sub-cities' || feeMax < MAX_FEE || curriculum !== 'All Curricula'
  const hasFilters = !!(debouncedQuery || type !== 'all' || moreFiltersActive)

  // Reset to page 1 whenever a filter changes (not on page changes themselves).
  useEffect(() => { setPage(1) }, [debouncedQuery, type, subCity, feeMax, curriculum])

  // Main results — server-side filtered + paginated.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    searchSchools({ query: debouncedQuery, type, subCity, feeMax, curriculum, page, pageSize: PAGE_SIZE })
      .then(({ schools, total }) => {
        if (cancelled) return
        setResults(schools)
        setTotal(total)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [debouncedQuery, type, subCity, feeMax, curriculum, page])

  // Map view needs many markers at once, not just one page — fetched
  // separately (and capped) only when that view is actually open.
  useEffect(() => {
    if (view !== 'map') return
    let cancelled = false
    searchSchools({ query: debouncedQuery, type, subCity, feeMax, curriculum, page: 1, pageSize: 2000 })
      .then(({ schools }) => { if (!cancelled) setMapSchools(schools) })
    return () => { cancelled = true }
  }, [view, debouncedQuery, type, subCity, feeMax, curriculum])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  function clearFilters() {
    setQuery(''); setType('all'); setSubCity('All Sub-cities')
    setFeeMax(MAX_FEE); setCurriculum('All Curricula')
  }

  function pickSuggestion(school: School) {
    setQuery(school.name_en)
    setShowSuggestions(false)
    setActiveIdx(-1)
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      pickSuggestion(suggestions[activeIdx])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false); setActiveIdx(-1)
    }
  }

  const typeAccent: Record<string, string> = {
    international: 'bg-violet-500',
    private:       'bg-cyan-500',
    public:        'bg-emerald-500',
    tvet:          'bg-orange-500',
  }

  function openSheet(tab: 'location' | 'more') {
    setSheetTab(tab)
    setLocationQuery('')
    setSheetOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f2f5ff' }}>
      <Navbar />

      {/* ── COMPACT STICKY CONTROLS ── */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-[100px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

          {/* Search + view toggle */}
          <div className="flex items-center gap-2">
            <div ref={searchRef} className="relative flex-1 min-w-0">
              <div className={`flex items-center gap-2.5 bg-white border rounded-2xl px-3.5 py-2.5 transition-all duration-200 ${
                showSuggestions && suggestions.length > 0
                  ? 'border-indigo-400 ring-4 ring-indigo-50'
                  : 'border-slate-200 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50'
              }`}>
                <Search size={17} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={e => { setQuery(sanitize(e.target.value)); setShowSuggestions(true); setActiveIdx(-1) }}
                  onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                  onKeyDown={onSearchKeyDown}
                  placeholder="Search schools..."
                  className="flex-1 text-slate-800 placeholder-slate-400 outline-none text-sm bg-transparent min-w-0"
                />
                {query && (
                  <button onClick={() => { setQuery(''); setShowSuggestions(false) }} className="text-slate-300 hover:text-slate-600 transition-colors shrink-0">
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Live autocomplete */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <button
                      key={s.id}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => pickSuggestion(s)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        i === activeIdx ? 'bg-indigo-50' : 'hover:bg-slate-50'
                      } ${i < suggestions.length - 1 ? 'border-b border-slate-50' : ''}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-black ${typeAccent[s.school_type]}`}>
                        {s.name_en.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">
                          <HighlightMatch text={s.name_en} query={query} />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <MapPin size={9} />
                          <HighlightMatch text={s.sub_city || ''} query={query} />
                        </div>
                      </div>
                      <ArrowRight size={13} className="text-slate-300 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View toggle — icon-only, compact */}
            <div className="flex items-center gap-0.5 bg-slate-100 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setView('grid')}
                aria-label="Grid view"
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
                  view === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'
                }`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setView('map')}
                aria-label="Map view"
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
                  view === 'map' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'
                }`}
              >
                <Map size={16} />
              </button>
            </div>
          </div>

          {/* One scrollable row: Location chip, More-filters chip, Type pills */}
          <div className="flex items-center gap-2 mt-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => openSheet('location')}
              className={`flex items-center gap-1.5 pl-2.5 pr-3 py-2 rounded-full text-sm font-semibold border shrink-0 transition-all ${
                subCity !== 'All Sub-cities'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              <span className="text-base leading-none">
                {subCity !== 'All Sub-cities' ? (CITY_META[subCity]?.emoji ?? '📍') : '📍'}
              </span>
              <span className="max-w-[100px] truncate">
                {subCity !== 'All Sub-cities' ? subCity : 'Location'}
              </span>
            </button>

            <button
              onClick={() => openSheet('more')}
              className={`flex items-center gap-1.5 pl-2.5 pr-3 py-2 rounded-full text-sm font-semibold border shrink-0 transition-all ${
                moreFiltersActive
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              <SlidersHorizontal size={13} />
              Filters
              {(feeMax < MAX_FEE ? 1 : 0) + (curriculum !== 'All Curricula' ? 1 : 0) > 0 && (
                <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold ${moreFiltersActive ? 'bg-white/25' : 'bg-indigo-100 text-indigo-600'}`}>
                  {(feeMax < MAX_FEE ? 1 : 0) + (curriculum !== 'All Curricula' ? 1 : 0)}
                </span>
              )}
            </button>

            <div className="w-px h-5 bg-slate-200 shrink-0" />

            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3.5 py-2 rounded-full text-sm font-semibold border shrink-0 transition-all ${
                  type === t
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {typeLabel(t)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── RESULTS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex-1">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            {loading ? 'Loading...' : (
              <>
                <span className="font-bold text-slate-800">{total}</span> found
                {subCity !== 'All Sub-cities' && <span className="ml-1 font-semibold text-indigo-600">in {subCity}</span>}
              </>
            )}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
              <X size={11} /> Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-72 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : view === 'grid' ? (
          results.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-300" />
              </div>
              <p className="font-semibold text-slate-600 text-lg">No schools found</p>
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {results.map((school, i) => (
                  <SchoolCard key={school.id} school={school} index={i} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={PAGE_SIZE}
                onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              />
            </>
          )
        ) : (
          <div className="h-[calc(100vh-260px)] min-h-[500px] rounded-2xl overflow-hidden shadow-sm">
            <MapComponent schools={mapSchools} height="100%" />
          </div>
        )}
      </div>

      <Footer />

      {/* ── FILTER SHEET (mobile bottom sheet / desktop modal) ── */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-900/40 animate-fade-in"
            onClick={() => setSheetOpen(false)}
          />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col animate-fade-slide-up">

            {/* Drag handle (mobile) */}
            <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Tab switcher */}
            <div className="flex items-center justify-between px-5 pt-3 pb-2 shrink-0">
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setSheetTab('location')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${sheetTab === 'location' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                >
                  Location
                </button>
                <button
                  onClick={() => setSheetTab('more')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${sheetTab === 'more' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                >
                  Fee &amp; Curriculum
                </button>
              </div>
              <button onClick={() => setSheetOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {sheetTab === 'location' ? (
                <div>
                  {/* Search inside sheet */}
                  <div className="px-5 pb-2">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
                      <Search size={15} className="text-slate-400 shrink-0" />
                      <input
                        type="text"
                        autoFocus
                        value={locationQuery}
                        onChange={e => setLocationQuery(e.target.value)}
                        placeholder="Search city or area..."
                        className="flex-1 text-sm text-slate-700 bg-transparent outline-none placeholder-slate-400"
                      />
                      {locationQuery && (
                        <button onClick={() => setLocationQuery('')} className="text-slate-300 hover:text-slate-600">
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pb-4">
                    {(!locationQuery || 'all areas'.includes(locationQuery.toLowerCase())) && (
                      <button
                        type="button"
                        onClick={() => { setSubCity('All Sub-cities'); setSheetOpen(false) }}
                        className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors active:bg-slate-100 ${subCity === 'All Sub-cities' ? 'bg-indigo-50' : ''}`}
                      >
                        <span className="text-lg w-6 text-center leading-none">📍</span>
                        <span className="flex-1 text-sm font-semibold text-slate-700">All Areas</span>
                        <span className="text-xs text-slate-400 font-medium">{Object.values(cityCounts).reduce((a, b) => a + b, 0)}</span>
                        {subCity === 'All Sub-cities' && <Check size={14} className="text-indigo-600 shrink-0" />}
                      </button>
                    )}

                    {(() => {
                      const q = locationQuery.toLowerCase()
                      const knownCities = new Set(REGION_GROUPS.flatMap(g => g.cities))
                      // Any city with schools that isn't in a curated region group yet
                      // still needs to be reachable — catches new cities automatically.
                      const otherCities = Object.keys(cityCounts).filter(c => !knownCities.has(c)).sort()
                      const allGroups = [
                        ...REGION_GROUPS,
                        ...(otherCities.length > 0 ? [{ region: 'Other Areas', emoji: '📍', cities: otherCities }] : []),
                      ]
                      const groups = allGroups.map(({ region, emoji, cities }) => {
                        const visible = cities.filter(city => {
                          const count = cityCounts[city] ?? 0
                          if (!count) return false
                          if (!q) return true
                          return city.toLowerCase().includes(q) || region.toLowerCase().includes(q)
                        })
                        return { region, emoji, visible }
                      }).filter(g => g.visible.length > 0)

                      if (groups.length === 0) {
                        return <div className="px-5 py-8 text-center text-sm text-slate-400">No area matches &quot;{locationQuery}&quot;</div>
                      }

                      return groups.map(({ region, emoji, visible }) => (
                        <div key={region}>
                          <div className="flex items-center gap-2 px-5 pt-3 pb-1">
                            <span className="text-sm leading-none">{emoji}</span>
                            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">{region}</span>
                          </div>
                          {visible.map(city => {
                            const meta = CITY_META[city] ?? { emoji: '📍' }
                            const count = cityCounts[city] ?? 0
                            const active = subCity === city
                            return (
                              <button
                                key={city}
                                type="button"
                                onClick={() => { setSubCity(city); setSheetOpen(false) }}
                                className={`w-full flex items-center gap-3 pl-9 pr-5 py-3 text-left transition-colors active:bg-slate-100 ${active ? 'bg-indigo-50' : ''}`}
                              >
                                <span className="text-base w-5 text-center leading-none shrink-0">{meta.emoji}</span>
                                <span className={`flex-1 text-sm font-semibold ${active ? 'text-indigo-700' : 'text-slate-700'}`}>{city}</span>
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}>{count}</span>
                                {active && <Check size={14} className="text-indigo-600 shrink-0" />}
                              </button>
                            )
                          })}
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              ) : (
                <div className="px-5 py-4 space-y-6">
                  {/* Curriculum */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-2">Curriculum</label>
                    <div className="relative">
                      <select
                        value={curriculum}
                        onChange={e => setCurriculum(e.target.value)}
                        className="w-full appearance-none border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                      >
                        {CURRICULA.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Fee */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-500">Max Annual Fee</label>
                      <span className="text-sm font-bold text-indigo-600">
                        {feeMax >= MAX_FEE ? 'Any price' : `${(feeMax / 1000).toFixed(0)}K ETB`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={MAX_FEE}
                      step={20000}
                      value={feeMax}
                      onChange={e => setFeeMax(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                      <span>Free</span><span>2M ETB</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky footer */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 shrink-0" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <button onClick={clearFilters} className="text-sm font-semibold text-slate-500 px-2">
                Clear all
              </button>
              <button
                onClick={() => setSheetOpen(false)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3 rounded-xl transition-colors"
              >
                Show {total} school{total !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
