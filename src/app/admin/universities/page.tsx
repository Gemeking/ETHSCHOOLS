'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, PlusCircle, Pencil, Trash2, ExternalLink, BookOpen, CheckCircle, XCircle } from 'lucide-react'
import { fetchAllUniversities, deleteUniversity } from '@/lib/supabase-universities'
import { universities as localUniversities } from '@/lib/university-data'
import { supabase } from '@/lib/supabase'
import Toast, { type ToastMsg } from '@/components/Toast'
import type { University, UniversityType } from '@/lib/types'

const TYPE_LABELS: Record<string, string> = {
  public: 'Public',
  private: 'Private',
  faith_based: 'Faith-Based',
}

export default function ManageUniversitiesPage() {
  const [allUniversities, setAllUniversities] = useState<University[]>(localUniversities)
  const [query, setQuery] = useState('')
  const [type, setType] = useState<UniversityType | 'all'>('all')
  const [deleting, setDeleting] = useState<number | null>(null)
  const [togglingVerified, setTogglingVerified] = useState<number | null>(null)
  const [toast, setToast] = useState<ToastMsg | null>(null)
  const showToast = useCallback((t: ToastMsg) => setToast(t), [])

  useEffect(() => {
    fetchAllUniversities().then(setAllUniversities)
  }, [])

  const filtered = useMemo(() => {
    return allUniversities.filter((u) => {
      if (query && !u.name_en.toLowerCase().includes(query.toLowerCase()) && !u.city.toLowerCase().includes(query.toLowerCase())) return false
      if (type !== 'all' && u.university_type !== type) return false
      return true
    })
  }, [allUniversities, query, type])

  async function handleToggleVerified(uni: University) {
    const newValue = !uni.verified
    setTogglingVerified(uni.id)
    setAllUniversities((prev) =>
      prev.map((u) => (u.id === uni.id ? { ...u, verified: newValue } : u))
    )
    const { error } = await supabase
      .from('universities')
      .update({ verified: newValue })
      .eq('id', uni.id)
    if (error) {
      setAllUniversities((prev) =>
        prev.map((u) => (u.id === uni.id ? { ...u, verified: uni.verified } : u))
      )
      showToast({ type: 'error', text: 'Could not update verified status. Please try again.' })
    } else {
      showToast({ type: 'success', text: `${uni.name_en} ${!uni.verified ? 'verified' : 'unverified'}` })
    }
    setTogglingVerified(null)
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    const err = await deleteUniversity(id)
    if (err) {
      showToast({ type: 'error', text: 'Delete failed. Please try again.' })
    } else {
      setAllUniversities((prev) => prev.filter((u) => u.id !== id))
      showToast({ type: 'success', text: `"${name}" deleted successfully.` })
    }
    setDeleting(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Universities</h1>
          <p className="text-slate-500 text-sm mt-1">{allUniversities.length} universities in database</p>
        </div>
        <Link
          href="/admin/universities/new"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <PlusCircle size={16} /> Add University
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or city..."
            className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'public', 'private', 'faith_based'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                type === t ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {t === 'all' ? 'All' : TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">University</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden lg:table-cell">Colleges</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Verified</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((uni) => (
                <tr key={uni.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                        uni.university_type === 'public' ? 'bg-emerald-600' :
                        uni.university_type === 'private' ? 'bg-blue-600' : 'bg-amber-600'
                      }`}>
                        {uni.name_en.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">{uni.name_en}</div>
                        <div className="text-xs text-slate-400">{uni.name_am}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      uni.university_type === 'public' ? 'bg-emerald-100 text-emerald-700' :
                      uni.university_type === 'private' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {TYPE_LABELS[uni.university_type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-sm hidden md:table-cell">{uni.city}, {uni.region}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs hidden lg:table-cell">
                    <span className="flex items-center gap-1">
                      <BookOpen size={12} /> {uni.departments.length} colleges
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleVerified(uni)}
                      disabled={togglingVerified === uni.id}
                      title={uni.verified ? 'Click to unverify' : 'Click to verify'}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all disabled:opacity-50 ${
                        uni.verified
                          ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600'
                          : 'bg-slate-100 text-slate-500 hover:bg-green-50 hover:text-green-700'
                      }`}
                    >
                      {uni.verified
                        ? <><CheckCircle size={12} /> Verified</>
                        : <><XCircle size={12} /> Unverified</>
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/universities/${uni.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        title="View"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <Link
                        href={`/admin/universities/${uni.id}/edit`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                      >
                        <Pencil size={12} /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(uni.id, uni.name_en)}
                        disabled={deleting === uni.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={12} /> {deleting === uni.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Search size={28} className="mx-auto mb-2 opacity-40" />
            <p>No universities match your search</p>
          </div>
        )}
      </div>
    </div>
  )
}
