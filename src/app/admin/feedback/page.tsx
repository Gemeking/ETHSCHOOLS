'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Flag, PlusCircle, MessageSquare, HelpCircle, Phone, User,
  Trash2, ExternalLink, Clock, CheckCircle2, XCircle, Eye,
} from 'lucide-react'
import {
  fetchAllFeedback, updateFeedbackStatus, deleteFeedback,
  type Feedback, type FeedbackStatus,
} from '@/lib/supabase-feedback'

const CATEGORY_META: Record<string, { label: string; icon: typeof Flag; color: string }> = {
  correction: { label: 'Wrong info',   icon: Flag,           color: 'bg-red-50 text-red-600 border-red-200' },
  new_school: { label: 'Missing school', icon: PlusCircle,   color: 'bg-blue-50 text-blue-600 border-blue-200' },
  general:    { label: 'General',      icon: MessageSquare,  color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  other:      { label: 'Other',        icon: HelpCircle,     color: 'bg-slate-50 text-slate-600 border-slate-200' },
}

const STATUS_META: Record<FeedbackStatus, { label: string; color: string }> = {
  pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700' },
  reviewed:  { label: 'Reviewed',  color: 'bg-blue-100 text-blue-700' },
  resolved:  { label: 'Resolved',  color: 'bg-emerald-100 text-emerald-700' },
  dismissed: { label: 'Dismissed', color: 'bg-slate-200 text-slate-500' },
}

const STATUS_FILTERS: (FeedbackStatus | 'all')[] = ['pending', 'reviewed', 'resolved', 'dismissed', 'all']

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FeedbackStatus | 'all'>('pending')

  useEffect(() => {
    fetchAllFeedback().then((data) => { setItems(data); setLoading(false) })
  }, [])

  async function setStatus(id: number, status: FeedbackStatus) {
    setItems((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)))
    await updateFeedbackStatus(id, status)
  }

  async function remove(id: number) {
    if (!confirm('Delete this submission permanently?')) return
    setItems((prev) => prev.filter((f) => f.id !== id))
    await deleteFeedback(id)
  }

  const visible = filter === 'all' ? items : items.filter((f) => f.status === filter)
  const counts = { pending: 0, reviewed: 0, resolved: 0, dismissed: 0 } as Record<FeedbackStatus, number>
  items.forEach((f) => { counts[f.status] = (counts[f.status] ?? 0) + 1 })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Feedback</h1>
        <p className="text-slate-500 text-sm mt-1">Corrections and suggestions submitted through the site</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              filter === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {s === 'all' ? 'All' : STATUS_META[s].label}
            {s !== 'all' && counts[s] > 0 && (
              <span className={`text-xs font-bold px-1.5 rounded-full ${filter === s ? 'bg-white/25' : 'bg-slate-100'}`}>{counts[s]}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Nothing here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((f) => {
            const cat = CATEGORY_META[f.category] ?? CATEGORY_META.other
            const Icon = cat.icon
            return (
              <div key={f.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cat.color}`}>
                      <Icon size={11} /> {cat.label}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_META[f.status].color}`}>
                      {STATUS_META[f.status].label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={11} /> {new Date(f.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button onClick={() => remove(f.id)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>

                {f.school_name && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold text-slate-800">{f.school_name}</span>
                    {f.school_id && (
                      <Link href={`/admin/schools/${f.school_id}/edit`} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-semibold">
                        Edit listing <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                )}

                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mb-3">{f.message}</p>

                {(f.contact_name || f.contact_phone) && (
                  <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
                    {f.contact_name && <span className="flex items-center gap-1"><User size={11} /> {f.contact_name}</span>}
                    {f.contact_phone && <a href={`tel:${f.contact_phone}`} className="flex items-center gap-1 hover:text-primary-600"><Phone size={11} /> {f.contact_phone}</a>}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                  {f.status !== 'reviewed' && (
                    <button onClick={() => setStatus(f.id, 'reviewed')} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                      <Eye size={12} /> Mark Reviewed
                    </button>
                  )}
                  {f.status !== 'resolved' && (
                    <button onClick={() => setStatus(f.id, 'resolved')} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                      <CheckCircle2 size={12} /> Mark Resolved
                    </button>
                  )}
                  {f.status !== 'dismissed' && (
                    <button onClick={() => setStatus(f.id, 'dismissed')} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors">
                      <XCircle size={12} /> Dismiss
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
