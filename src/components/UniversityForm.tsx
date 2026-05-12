'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, Trash2, Save, AlertCircle, CheckCircle, X, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { saveUniversity } from '@/lib/supabase-universities'
import type { University, Department } from '@/lib/types'
import { ETHIOPIA_REGIONS } from '@/lib/types'
import ImageUploader from './ImageUploader'

type FormData = Omit<University, 'id'>

const EMPTY_FORM: FormData = {
  name_en: '',
  name_am: '',
  university_type: 'public',
  city: '',
  region: 'Addis Ababa',
  latitude: 9.0347,
  longitude: 38.764,
  established: null,
  description: '',
  phone: null,
  email: null,
  website: null,
  departments: [],
  images: [],
  image_url: null,
  tags: [],
  verified: false,
  student_count: null,
  fee_range_etb: null,
}

export default function UniversityForm({ initial }: { initial?: University }) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(
    initial
      ? { ...initial, departments: initial.departments ?? [], images: initial.images ?? [], tags: initial.tags ?? [] }
      : EMPTY_FORM
  )
  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [expandedDept, setExpandedDept] = useState<number | null>(0)
  const [imagesUploading, setImagesUploading] = useState(false)

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // -- Tags
  function addTag() {
    const t = newTag.trim().toLowerCase().replace(/\s+/g, '-')
    if (!t || form.tags.includes(t)) return
    set('tags', [...form.tags, t])
    setNewTag('')
  }

  // -- Departments
  function addDepartment() {
    set('departments', [...form.departments, { name: '', programs: [] }])
    setExpandedDept(form.departments.length)
  }

  function removeDepartment(idx: number) {
    set('departments', form.departments.filter((_, i) => i !== idx))
  }

  function updateDeptName(idx: number, name: string) {
    const updated = [...form.departments]
    updated[idx] = { ...updated[idx], name }
    set('departments', updated)
  }

  function updateDeptPrograms(idx: number, text: string) {
    const programs = text.split('\n').map((p) => p.trim()).filter(Boolean)
    const updated = [...form.departments]
    updated[idx] = { ...updated[idx], programs }
    set('departments', updated)
  }

  async function handleSave() {
    if (!form.name_en.trim()) { setError('University name (English) is required'); return }
    if (!form.city.trim()) { setError('City is required'); return }
    setSaving(true)
    setError('')
    const result = await saveUniversity(form, initial?.id)
    setSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => router.push(`/admin/universities/${result.id}/edit`), 1200)
    }
  }

  const inputClass = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white'
  const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{initial ? 'Edit University' : 'Add University'}</h1>
        <button
          onClick={handleSave}
          disabled={saving || imagesUploading}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
        >
          <Save size={16} /> {imagesUploading ? 'Uploading...' : saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          <AlertCircle size={18} className="shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm">
          <CheckCircle size={18} className="shrink-0" /> University saved successfully!
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-base">Basic Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Name (English) *</label>
            <input className={inputClass} value={form.name_en} onChange={(e) => set('name_en', e.target.value)} placeholder="Addis Ababa University" />
          </div>
          <div>
            <label className={labelClass}>Name (Amharic)</label>
            <input className={inputClass} value={form.name_am ?? ''} onChange={(e) => set('name_am', e.target.value)} placeholder="አዲስ አበባ ዩኒቨርሲቲ" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>University Type</label>
            <select className={inputClass} value={form.university_type} onChange={(e) => set('university_type', e.target.value as University['university_type'])}>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="faith_based">Faith-Based</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Established Year</label>
            <input className={inputClass} type="number" value={form.established ?? ''} onChange={(e) => set('established', e.target.value ? Number(e.target.value) : null)} placeholder="1950" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Brief description of the university..." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Student Count</label>
            <input className={inputClass} value={form.student_count ?? ''} onChange={(e) => set('student_count', e.target.value || null)} placeholder="~20,000" />
          </div>
          <div>
            <label className={labelClass}>Annual Tuition (ETB)</label>
            <input className={inputClass} value={form.fee_range_etb ?? ''} onChange={(e) => set('fee_range_etb', e.target.value || null)} placeholder="Free / 30,000 – 80,000 ETB" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="verified" checked={form.verified} onChange={(e) => set('verified', e.target.checked)} className="w-4 h-4 accent-primary-600" />
          <label htmlFor="verified" className="text-sm text-slate-600 font-medium">Verified listing</label>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-base">Location</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>City *</label>
            <input className={inputClass} value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Addis Ababa" />
          </div>
          <div>
            <label className={labelClass}>Region</label>
            <select className={inputClass} value={form.region} onChange={(e) => set('region', e.target.value)}>
              {ETHIOPIA_REGIONS.filter((r) => r !== 'All Regions').map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Latitude</label>
            <input className={inputClass} type="number" step="0.0001" value={form.latitude} onChange={(e) => set('latitude', Number(e.target.value))} />
          </div>
          <div>
            <label className={labelClass}>Longitude</label>
            <input className={inputClass} type="number" step="0.0001" value={form.longitude} onChange={(e) => set('longitude', Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-base">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value || null)} placeholder="+251 11 123 4567" />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value || null)} placeholder="info@university.edu.et" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Website</label>
            <input className={inputClass} value={form.website ?? ''} onChange={(e) => set('website', e.target.value || null)} placeholder="university.edu.et" />
          </div>
        </div>
      </div>

      {/* Departments */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <BookOpen size={16} className="text-primary-600" /> Colleges & Programs
          </h2>
          <button
            onClick={addDepartment}
            className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-xl border border-primary-200 hover:bg-primary-50 transition-colors"
          >
            <PlusCircle size={13} /> Add College
          </button>
        </div>

        {form.departments.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">No colleges added yet. Click &quot;Add College&quot; to start.</p>
        )}

        {form.departments.map((dept, idx) => (
          <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
              <button onClick={() => setExpandedDept(expandedDept === idx ? null : idx)} className="flex items-center gap-2 text-sm font-semibold text-slate-700 flex-1 text-left">
                {expandedDept === idx ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                {dept.name || `College ${idx + 1}`}
                <span className="text-xs text-slate-400 font-normal">{dept.programs.length} programs</span>
              </button>
              <button onClick={() => removeDepartment(idx)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 ml-2">
                <Trash2 size={13} />
              </button>
            </div>
            {expandedDept === idx && (
              <div className="p-4 space-y-3">
                <div>
                  <label className={labelClass}>College / Faculty Name</label>
                  <input
                    className={inputClass}
                    value={dept.name}
                    onChange={(e) => updateDeptName(idx, e.target.value)}
                    placeholder="College of Engineering"
                  />
                </div>
                <div>
                  <label className={labelClass}>Programs (one per line)</label>
                  <textarea
                    className={inputClass}
                    rows={6}
                    value={dept.programs.join('\n')}
                    onChange={(e) => updateDeptPrograms(idx, e.target.value)}
                    placeholder="Civil Engineering&#10;Electrical Engineering&#10;Mechanical Engineering"
                  />
                  <p className="text-xs text-slate-400 mt-1">{dept.programs.length} programs entered</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-base">University Photos</h2>
        <ImageUploader
          images={form.images}
          onChange={(imgs) => { set('images', imgs); set('image_url', imgs[0] ?? null) }}
          folder="universities"
          onUploadingChange={setImagesUploading}
        />
      </div>

      {/* Tags */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-base">Tags</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
            placeholder="engineering, medicine, research..."
          />
          <button onClick={addTag} className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-slate-600 text-white text-sm font-semibold hover:bg-slate-700 transition-colors">
            <PlusCircle size={15} /> Add
          </button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700 font-medium">
                {tag}
                <button onClick={() => set('tags', form.tags.filter((t) => t !== tag))} className="text-slate-400 hover:text-red-500 ml-0.5">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pb-8">
        <button
          onClick={handleSave}
          disabled={saving || imagesUploading}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
        >
          <Save size={16} /> {imagesUploading ? 'Uploading...' : saving ? 'Saving...' : 'Save University'}
        </button>
      </div>
    </div>
  )
}
