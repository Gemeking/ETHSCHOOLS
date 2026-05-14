'use client'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Search, SlidersHorizontal, X, Map, Grid3X3,
  ChevronDown, MapPin, ArrowRight, Check,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SchoolCard from '@/components/SchoolCard'
import { schools as localSchools } from '@/lib/data'
import { fetchAllSchools } from '@/lib/supabase-data'
import { SUB_CITIES, CURRICULA, typeLabel } from '@/lib/utils'
import type { SchoolType, School } from '@/lib/types'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-full bg-slate-200 animate-pulse rounded-2xl" />,
})

const TYPES: SchoolType[] = ['all', 'international', 'private', 'public']
const MAX_FEE = 2_000_000

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
  // Sheger City
  'Burayu':           { emoji: '🏡' },
  'Sebeta':           { emoji: '🛣️' },
  'Sululta':          { emoji: '🌾' },
  'Legetafo':         { emoji: '🌲' },
  'Gelan':            { emoji: '🏘️' },
  // Amhara Region
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
  // Oromia Region
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
  'Chiro':            { emoji: '🌵' },
  'Dodola':           { emoji: '🏔️' },
  'Tepi':             { emoji: '🍵' },
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
  const params = useSearchParams()

  const [allSchools, setAllSchools] = useState<School[]>(localSchools)
  const [query, setQuery]           = useState(params.get('q') || '')
  const [type, setType]             = useState<SchoolType>((params.get('type') as SchoolType) || 'all')
  const [subCity, setSubCity]       = useState(params.get('city') || 'All Sub-cities')
  const [feeMax, setFeeMax]         = useState(MAX_FEE)
  const [curriculum, setCurriculum] = useState('All Curricula')
  const [view, setView]             = useState<'grid' | 'map'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIdx, setActiveIdx]   = useState(-1)
  const [locationOpen, setLocationOpen]   = useState(false)
  const [locationQuery, setLocationQuery] = useState('')
  const searchRef   = useRef<HTMLDivElement>(null)
  const locationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAllSchools().then(setAllSchools)
  }, [])

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
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false); setLocationQuery('')
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q || q.length < 2) return []
    return allSchools
      .filter(s =>
        s.name_en.toLowerCase().includes(q) ||
        s.sub_city?.toLowerCase().includes(q) ||
        s.curriculum?.toLowerCase().includes(q)
      )
      .slice(0, 7)
  }, [query, allSchools])

  const cityCounts = useMemo(() => {
    const map: Record<string, number> = {}
    allSchools.forEach(s => {
      if (s.sub_city) map[s.sub_city] = (map[s.sub_city] || 0) + 1
    })
    return map
  }, [allSchools])

  const filtered = useMemo(() => {
    return allSchools.filter(s => {
      if (query) {
        const q = query.toLowerCase()
        const inName       = s.name_en.toLowerCase().includes(q)
        const inCity       = s.sub_city?.toLowerCase().includes(q)
        const inCurriculum = s.curriculum?.toLowerCase().includes(q)
        if (!inName && !inCity && !inCurriculum) return false
      }
      if (type !== 'all' && s.school_type !== type) return false
      if (subCity !== 'All Sub-cities' && s.sub_city !== subCity) return false
      if (s.fee_min > feeMax) return false
      if (curriculum !== 'All Curricula' && !s.curriculum?.toLowerCase().includes(curriculum.split(' ')[0].toLowerCase())) return false
      return true
    })
  }, [allSchools, query, type, subCity, feeMax, curriculum])

  const hasFilters = !!(query || type !== 'all' || subCity !== 'All Sub-cities' || feeMax < MAX_FEE || curriculum !== 'All Curricula')

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

  const typeAccent: Record<School['school_type'], string> = {
    international: 'bg-violet-500',
    private:       'bg-cyan-500',
    public:        'bg-emerald-500',
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f2f5ff' }}>
      <Navbar />

      {/* ── PAGE HEADER ── */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0">

          {/* Title row */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Schools in Ethiopia
              </h1>
              <p className="text-sm text-slate-400 mt-0.5 font-medium">
                {allSchools.length} schools across all sub-cities
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setView('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  view === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Grid3X3 size={14} /> Grid
              </button>
              <button
                onClick={() => setView('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  view === 'map' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Map size={14} /> Map
              </button>
            </div>
          </div>

          {/* ── Search + Location row ── */}
          <div className="flex gap-3 mb-4 max-w-3xl">

            {/* School search */}
            <div ref={searchRef} className="relative flex-1 min-w-0">
              <div className={`flex items-center gap-3 bg-white border rounded-2xl px-4 py-3 transition-all duration-200 shadow-sm ${
                showSuggestions && suggestions.length > 0
                  ? 'border-indigo-400 ring-4 ring-indigo-50'
                  : 'border-slate-200 hover:border-indigo-300 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50'
              }`}>
                <Search size={17} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setShowSuggestions(true); setActiveIdx(-1) }}
                  onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                  onKeyDown={onSearchKeyDown}
                  placeholder="School name or curriculum..."
                  className="flex-1 text-slate-800 placeholder-slate-400 outline-none text-sm bg-transparent min-w-0"
                />
                {query && (
                  <button onClick={() => { setQuery(''); setShowSuggestions(false) }} className="text-slate-300 hover:text-slate-600 transition-colors shrink-0">
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* School autocomplete */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                  <div className="px-3 py-2 border-b border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suggestions</p>
                  </div>
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
                        <div className="text-sm font-semibold text-slate-800">
                          <HighlightMatch text={s.name_en} query={query} />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <MapPin size={9} />
                          <HighlightMatch text={s.sub_city || ''} query={query} />
                          <span>·</span>
                          <span>{typeLabel(s.school_type)}</span>
                        </div>
                      </div>
                      <ArrowRight size={13} className="text-slate-300 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Location dropdown ── */}
            <div ref={locationRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => { setLocationOpen(v => !v); setLocationQuery('') }}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-semibold transition-all duration-200 shadow-sm whitespace-nowrap ${
                  subCity !== 'All Sub-cities'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
                    : locationOpen
                      ? 'bg-white border-indigo-400 ring-4 ring-indigo-50 text-slate-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-slate-900'
                }`}
              >
                <span className="text-base leading-none">
                  {subCity !== 'All Sub-cities' ? (CITY_META[subCity]?.emoji ?? '📍') : '📍'}
                </span>
                <span className="max-w-[120px] truncate">
                  {subCity !== 'All Sub-cities' ? subCity : 'All Areas'}
                </span>
                {subCity !== 'All Sub-cities' && (
                  <span className="bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {cityCounts[subCity] ?? 0}
                  </span>
                )}
                <ChevronDown size={14} className={`transition-transform duration-200 ${locationOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Location dropdown panel */}
              {locationOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                  {/* Search input inside dropdown */}
                  <div className="p-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
                      <Search size={13} className="text-slate-400 shrink-0" />
                      <input
                        type="text"
                        autoFocus
                        value={locationQuery}
                        onChange={e => setLocationQuery(e.target.value)}
                        placeholder="Search city or area..."
                        className="flex-1 text-sm text-slate-700 bg-transparent outline-none placeholder-slate-400"
                      />
                      {locationQuery && (
                        <button onClick={() => setLocationQuery('')} className="text-slate-300 hover:text-slate-600 transition-colors">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Options list */}
                  <div className="overflow-y-auto max-h-64 py-1">
                    {/* All Areas option */}
                    {(!locationQuery || 'all areas'.includes(locationQuery.toLowerCase())) && (
                      <button
                        type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => { setSubCity('All Sub-cities'); setLocationOpen(false); setLocationQuery('') }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50 ${
                          subCity === 'All Sub-cities' ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <span className="text-base w-6 text-center leading-none">📍</span>
                        <span className="flex-1 text-sm font-semibold text-slate-700">All Areas</span>
                        <span className="text-xs text-slate-400 font-medium">{allSchools.length}</span>
                        {subCity === 'All Sub-cities' && <Check size={13} className="text-indigo-600 shrink-0" />}
                      </button>
                    )}

                    {/* City options filtered by locationQuery */}
                    {SUB_CITIES.slice(1)
                      .filter(city => {
                        const count = cityCounts[city] ?? 0
                        if (!count) return false
                        if (!locationQuery) return true
                        return city.toLowerCase().includes(locationQuery.toLowerCase())
                      })
                      .map(city => {
                        const meta = CITY_META[city] ?? { emoji: '📍' }
                        const count = cityCounts[city] ?? 0
                        const active = subCity === city
                        return (
                          <button
                            key={city}
                            type="button"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => { setSubCity(city); setLocationOpen(false); setLocationQuery('') }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50 ${
                              active ? 'bg-indigo-50' : ''
                            }`}
                          >
                            <span className="text-base w-6 text-center leading-none">{meta.emoji}</span>
                            <span className={`flex-1 text-sm font-semibold ${active ? 'text-indigo-700' : 'text-slate-700'}`}>{city}</span>
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}>{count}</span>
                            {active && <Check size={13} className="text-indigo-600 shrink-0" />}
                          </button>
                        )
                      })
                    }

                    {/* Empty state */}
                    {locationQuery && SUB_CITIES.slice(1).filter(city => (cityCounts[city] ?? 0) > 0 && city.toLowerCase().includes(locationQuery.toLowerCase())).length === 0 && (
                      <div className="px-4 py-6 text-center text-sm text-slate-400">
                        No area matches &quot;{locationQuery}&quot;
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* School type tabs */}
          <div className="flex gap-2 flex-wrap mb-5">
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  type === t
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                {typeLabel(t)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY: SIDEBAR + GRID ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex gap-7 w-full flex-1">

        {/* Sidebar */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} sm:block w-full sm:w-56 shrink-0`}>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-20 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal size={14} /> Filters
              </h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors">
                  <X size={11} /> Clear
                </button>
              )}
            </div>

            {/* Curriculum */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Curriculum
              </label>
              <div className="relative">
                <select
                  value={curriculum}
                  onChange={e => setCurriculum(e.target.value)}
                  className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white cursor-pointer"
                >
                  {CURRICULA.map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Max fee slider */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Max Annual Fee
              </label>
              <div className="text-sm font-bold text-indigo-600 mb-2.5">
                {feeMax >= MAX_FEE ? 'Any price' : `${(feeMax / 1000).toFixed(0)}K ETB`}
              </div>
              <input
                type="range"
                min={0}
                max={MAX_FEE}
                step={20000}
                value={feeMax}
                onChange={e => setFeeMax(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                <span>Free</span><span>2M ETB</span>
              </div>
            </div>

            {hasFilters && (
              <div className="pt-3 border-t border-slate-50 text-xs text-slate-500">
                <span className="font-bold text-slate-800">{filtered.length}</span> of {allSchools.length} schools
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="sm:hidden w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 bg-white shadow-sm"
          >
            <SlidersHorizontal size={14} />
            {filtersOpen ? 'Hide Filters' : 'Show Filters'}
            {hasFilters && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
          </button>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Results bar */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-slate-500">
              <span className="font-bold text-slate-800">{filtered.length}</span>
              {' '}school{filtered.length !== 1 ? 's' : ''} found
              {subCity !== 'All Sub-cities' && (
                <span className="ml-1 font-semibold text-indigo-600">in {subCity}</span>
              )}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <X size={11} /> Clear filters
              </button>
            )}
          </div>

          {view === 'grid' ? (
            filtered.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-slate-300" />
                </div>
                <p className="font-semibold text-slate-600 text-lg">No schools found</p>
                <p className="text-sm text-slate-400 mt-1.5 mb-5">Try adjusting your search or filters</p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((school, i) => (
                  <SchoolCard key={school.id} school={school} index={i} />
                ))}
              </div>
            )
          ) : (
            <div className="h-[calc(100vh-300px)] min-h-[500px] rounded-2xl overflow-hidden shadow-sm">
              <MapComponent schools={filtered} height="100%" />
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}
