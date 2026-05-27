'use client'
import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Search, PlusCircle, Pencil, Trash2, ExternalLink, Globe, Lock, Building2, CheckCircle, XCircle, Wrench } from 'lucide-react'
import { typeLabel } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { deleteSchool } from '@/lib/supabase-data'
import type { SchoolType, School } from '@/lib/types'

const TYPE_ICONS: Record<string, React.ElementType> = { international: Globe, private: Lock, public: Building2, tvet: Wrench }

const TYPE_COLORS: Record<string, string> = {
  international: 'bg-violet-600',
  private:       'bg-blue-600',
  public:        'bg-green-600',
  tvet:          'bg-orange-500',
}

const BADGE_COLORS: Record<string, string> = {
  international: 'bg-violet-100 text-violet-700',
  private:       'bg-blue-100 text-blue-700',
  public:        'bg-green-100 text-green-700',
  tvet:          'bg-orange-100 text-orange-700',
}

export default function ManageSchoolsPage() {
  const [query, setQuery]     = useState('')
  const [type, setType]       = useState<SchoolType | 'all'>('all')
  const [schools, setSchools] = useState<School[]>([])
  const [toggling, setToggling]   = useState<number | null>(null)
  const [deleting, setDeleting]   = useState<number | null>(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    supabase.from('schools').select('*').order('id').then(({ data, error }) => {
      if (!error && data) setSchools(data as School[])
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    return schools.filter((s) => {
      if (query && !s.name_en.toLowerCase().includes(query.toLowerCase()) && !s.sub_city?.toLowerCase().includes(query.toLowerCase())) return false
      if (type === 'tvet') return s.tags?.includes('tvet')
      if (type !== 'all') return s.school_type === type && !s.tags?.includes('tvet')
      return true
    })
  }, [query, type, schools])

  async function toggleVerified(school: School) {
    const newValue = !school.verified
    setToggling(school.id)
    setSchools(prev => prev.map(s => s.id === school.id ? { ...s, verified: newValue } : s))
    const { error } = await supabase.from('schools').update({ verified: newValue }).eq('id', school.id)
    if (error) {
      setSchools(prev => prev.map(s => s.id === school.id ? { ...s, verified: school.verified } : s))
      alert(`Failed to update: ${error.message}`)
    }
    setToggling(null)
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"?\n\nThis cannot be undone.`)) return
    setDeleting(id)
    const err = await deleteSchool(id)
    if (err) {
      alert('Delete failed: ' + err)
    } else {
      setSchools(prev => prev.filter(s => s.id !== id))
    }
    setDeleting(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Schools</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Loading…' : `${schools.length} schools in database`}
          </p>
        </div>
        <Link
          href="/admin/schools/new"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <PlusCircle size={16} /> Add School
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or sub-city..."
            className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'international', 'private', 'public', 'tvet'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                type === t ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {typeLabel(t)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">School</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Sub-city</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden lg:table-cell">Fees (ETB)</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden lg:table-cell">Curriculum</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Verified</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((school) => {
                const isTvet = school.tags?.includes('tvet')
                const displayType = isTvet ? 'tvet' : school.school_type
                const TypeIcon = TYPE_ICONS[displayType] ?? Building2
                const isToggling = toggling === school.id
                const isDeleting = deleting === school.id
                return (
                  <tr key={school.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${TYPE_COLORS[displayType] ?? 'bg-slate-500'}`}>
                          {school.name_en.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{school.name_en}</div>
                          <div className="text-xs text-slate-400">{school.name_am}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE_COLORS[displayType] ?? 'bg-slate-100 text-slate-600'}`}>
                        <TypeIcon size={10} /> {typeLabel(displayType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm hidden md:table-cell">{school.sub_city}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs hidden lg:table-cell">
                      {school.fee_range_etb?.includes('Free') ? 'Free' : (school.fee_range_etb || 'Contact school')}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell max-w-36 truncate">
                      {school.curriculum}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleVerified(school)}
                        disabled={isToggling}
                        title={school.verified ? 'Click to unverify' : 'Click to verify'}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                          isToggling ? 'opacity-50 cursor-not-allowed' :
                          school.verified
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                        }`}
                      >
                        {school.verified
                          ? <><CheckCircle size={11} /> Verified</>
                          : <><XCircle size={11} /> Unverified</>
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/schools/${school.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          title="View"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <Link
                          href={`/admin/schools/${school.id}/edit`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                        >
                          <Pencil size={12} /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(school.id, school.name_en)}
                          disabled={isDeleting}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={12} /> {isDeleting ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && !loading && (
          <div className="text-center py-12 text-slate-400">
            <Search size={28} className="mx-auto mb-2 opacity-40" />
            <p>No schools match your search</p>
          </div>
        )}
        {loading && (
          <div className="text-center py-12 text-slate-400">
            <p className="animate-pulse">Loading schools…</p>
          </div>
        )}
      </div>
    </div>
  )
}
