'use client'
import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Flag, Search, X, CheckCircle2, School as SchoolIcon,
  PlusCircle, MessageSquare, HelpCircle, ArrowLeft,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { fetchAllSchools } from '@/lib/supabase-data'
import { submitFeedback, type FeedbackCategory } from '@/lib/supabase-feedback'
import type { School } from '@/lib/types'

const CATEGORIES: { value: FeedbackCategory; label: string; hint: string; icon: typeof Flag }[] = [
  { value: 'correction', label: 'Wrong information', hint: 'Fees, phone, location, etc. are incorrect', icon: Flag },
  { value: 'new_school', label: 'Missing school', hint: 'A school isn’t listed yet', icon: PlusCircle },
  { value: 'general',    label: 'General feedback',  hint: 'Ideas, suggestions for the site', icon: MessageSquare },
  { value: 'other',      label: 'Something else',    hint: '', icon: HelpCircle },
]

export default function ReportPage() {
  return (
    <Suspense fallback={null}>
      <ReportPageContent />
    </Suspense>
  )
}

function ReportPageContent() {
  const params = useSearchParams()
  const [allSchools, setAllSchools] = useState<School[]>([])
  const [category, setCategory] = useState<FeedbackCategory>('correction')
  const [schoolQuery, setSchoolQuery] = useState('')
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [message, setMessage] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAllSchools().then(setAllSchools)
  }, [])

  useEffect(() => {
    const prefill = params.get('school')
    if (prefill) setSchoolQuery(prefill)
  }, [params])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const suggestions = schoolQuery.trim().length >= 2 && !selectedSchool
    ? allSchools.filter(s => s.name_en.toLowerCase().includes(schoolQuery.trim().toLowerCase())).slice(0, 6)
    : []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) { setError('Please describe the issue.'); return }
    setError('')
    setSubmitting(true)
    const { error: err } = await submitFeedback({
      category,
      school_id: selectedSchool?.id ?? null,
      school_name: selectedSchool?.name_en ?? (schoolQuery.trim() || null),
      message: message.trim(),
      contact_name: contactName.trim() || null,
      contact_phone: contactPhone.trim() || null,
    })
    setSubmitting(false)
    if (err) { setError('Something went wrong — please try again, or message us on Telegram instead.'); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f2f5ff' }}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mb-2">Thanks — we got it</h1>
            <p className="text-sm text-slate-500 mb-6">
              Our team reviews every submission. If you left contact details, we may reach out for more info.
            </p>
            <Link href="/schools" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Back to Schools
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f2f5ff' }}>
      <Navbar />

      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/schools" className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors w-fit mb-4">
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 flex items-center gap-3">
            <Flag className="shrink-0" /> Report an Issue
          </h1>
          <p className="text-white/85 max-w-xl leading-relaxed text-sm">
            Spotted wrong info, a missing school, or have an idea for the site? Tell us below —
            our team reviews every submission before anything changes.
          </p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">What's this about?</label>
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORIES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-left transition-all ${
                    category === value
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-100'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon size={16} className={category === value ? 'text-amber-600' : 'text-slate-400'} />
                  <span className={`text-sm font-semibold ${category === value ? 'text-amber-800' : 'text-slate-600'}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* School (optional, autocomplete) */}
          {category !== 'general' && (
            <div ref={searchRef} className="relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">
                Which school? <span className="normal-case font-medium text-slate-400">(optional)</span>
              </label>
              <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-3.5 py-3 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-50 transition-all">
                <Search size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={schoolQuery}
                  onChange={e => { setSchoolQuery(e.target.value); setSelectedSchool(null); setShowSuggestions(true) }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search school name, or type a new one..."
                  className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent min-w-0"
                />
                {schoolQuery && (
                  <button type="button" onClick={() => { setSchoolQuery(''); setSelectedSchool(null) }} className="text-slate-300 hover:text-slate-600 shrink-0">
                    <X size={14} />
                  </button>
                )}
              </div>
              {selectedSchool && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-medium">
                  <CheckCircle2 size={12} /> Linked to existing listing
                </div>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-30 max-h-64 overflow-y-auto">
                  {suggestions.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => { setSelectedSchool(s); setSchoolQuery(s.name_en); setShowSuggestions(false) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0"
                    >
                      <SchoolIcon size={14} className="text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">{s.name_en}</div>
                        <div className="text-xs text-slate-400">{s.sub_city}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Message */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Details</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              placeholder="Tell us what's wrong, what's missing, or your idea..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-50 transition-all resize-none"
            />
          </div>

          {/* Contact (optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">
                Your name <span className="normal-case font-medium text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="So we know who to thank"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">
                Phone <span className="normal-case font-medium text-slate-400">(optional)</span>
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="In case we need details"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-50 transition-all"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-bold py-3.5 rounded-xl transition-colors"
          >
            {submitting ? 'Sending...' : 'Submit'}
          </button>

          <p className="text-center text-xs text-slate-400">
            Prefer Telegram? Message{' '}
            <a href="https://t.me/abrolabs" target="_blank" rel="noopener noreferrer" className="text-amber-600 font-semibold hover:underline">@abrolabs</a> instead.
          </p>
        </form>
      </main>

      <Footer />
    </div>
  )
}
