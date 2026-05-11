'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, Trash2, Image, Save, ArrowLeft, AlertCircle } from 'lucide-react'
import type { School } from '@/lib/types'
import { SUB_CITIES } from '@/lib/utils'
import { saveSchool } from '@/lib/supabase-data'

type FormData = Omit<School, 'id' | 'fee_min' | 'fee_max' | 'source' | 'verified'>

function ImageRow({ url, isCover, onDelete, onSetCover }: { url: string; isCover: boolean; onDelete: () => void; onSetCover: () => void }) {
  const [broken, setBroken] = useState(false)
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${broken ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
      {/* Thumbnail */}
      <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0 relative">
        {broken ? (
          <div className="w-full h-full flex items-center justify-center text-red-400 text-xs text-center p-1">
            <span>❌<br/>Broken</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setBroken(true)}
          />
        )}
      </div>

      {/* URL + status */}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-600 truncate">{url}</div>
        <div className="flex items-center gap-2 mt-1">
          {isCover && <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">★ Cover</span>}
          {broken && <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">URL not accessible — delete it</span>}
          {!isCover && !broken && (
            <button type="button" onClick={onSetCover} className="text-xs text-slate-400 hover:text-primary-600 underline">
              Set as Cover
            </button>
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        type="button"
        onClick={onDelete}
        title="Delete image"
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors shrink-0"
      >
        <Trash2 size={13} /> Delete
      </button>
    </div>
  )
}

const DEFAULT: FormData = {
  name_en: '', name_am: '',
  school_type: 'private',
  curriculum: 'Ethiopian',
  grades: 'KG - Grade 12',
  language: 'Amharic & English',
  sub_city: 'Bole',
  woreda: '',
  latitude: 9.02,
  longitude: 38.75,
  fee_range_etb: '',
  fee_range_usd: '',
  phone: '',
  email: '',
  website: '',
  description: '',
  established: new Date().getFullYear(),
  coordinates_accuracy: 'low',
  image_url: null,
  images: [],
  tags: [],
}

interface Props {
  initial?: Partial<School>
  title: string
}

export default function SchoolForm({ initial, title }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({ ...DEFAULT, ...initial })
  const [newImage, setNewImage] = useState('')
  const [newTag, setNewTag] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addImage() {
    if (newImage.trim()) {
      set('images', [...(form.images || []), newImage.trim()])
      setNewImage('')
    }
  }

  function removeImage(i: number) {
    set('images', (form.images || []).filter((_, idx) => idx !== i))
  }

  function addTag() {
    const t = newTag.trim().toLowerCase()
    if (t && !(form.tags || []).includes(t)) {
      set('tags', [...(form.tags || []), t])
      setNewTag('')
    }
  }

  function removeTag(t: string) {
    set('tags', (form.tags || []).filter((x) => x !== t))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError('')

    const { id, error } = await saveSchool(
      { ...form, verified: initial?.verified ?? false },
      initial?.id
    )

    setSaving(false)

    if (error) {
      setSaveError(error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.push(`/admin/schools/${id}/edit`)
    }
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white'
  const labelCls = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5'

  return (
    <form onSubmit={handleSave} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button type="button" onClick={() => router.back()} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-1">
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Save size={15} /> {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save School'}
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          ✓ School saved to Supabase successfully!
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={15} /> {saveError}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-base">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>School Name (English) *</label>
            <input required value={form.name_en} onChange={(e) => set('name_en', e.target.value)} placeholder="e.g. Sandford International School" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>School Name (Amharic)</label>
            <input value={form.name_am} onChange={(e) => set('name_am', e.target.value)} placeholder="ሳንድፎርድ ኢንተርናሽናል ስኩል" className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Brief description of the school..."
            className={`${inputCls} resize-none`}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>School Type *</label>
            <select value={form.school_type} onChange={(e) => set('school_type', e.target.value as School['school_type'])} className={inputCls}>
              <option value="international">International</option>
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Established Year</label>
            <input type="number" value={form.established} onChange={(e) => set('established', Number(e.target.value))} min={1900} max={2025} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Grades Offered</label>
            <input value={form.grades} onChange={(e) => set('grades', e.target.value)} placeholder="KG - Grade 12" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Curriculum</label>
            <input value={form.curriculum} onChange={(e) => set('curriculum', e.target.value)} placeholder="Ethiopian / IB / Cambridge..." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Language of Instruction</label>
            <input value={form.language} onChange={(e) => set('language', e.target.value)} placeholder="Amharic & English" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-base">Location</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Sub-city *</label>
            <select value={form.sub_city} onChange={(e) => set('sub_city', e.target.value)} className={inputCls}>
              {SUB_CITIES.filter((c) => c !== 'All Sub-cities').map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Woreda</label>
            <input value={form.woreda} onChange={(e) => set('woreda', e.target.value)} placeholder="e.g. 03" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Latitude *</label>
            <input type="number" step="0.0001" value={form.latitude} onChange={(e) => set('latitude', Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Longitude *</label>
            <input type="number" step="0.0001" value={form.longitude} onChange={(e) => set('longitude', Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Coordinates Accuracy</label>
            <select value={form.coordinates_accuracy} onChange={(e) => set('coordinates_accuracy', e.target.value as School['coordinates_accuracy'])} className={inputCls}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low (approximate)</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Tip: Go to Google Maps, right-click on the school location → copy the coordinates.
        </p>
      </div>

      {/* Fees */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-base">Fees</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Fee Range (ETB/year) *</label>
            <input value={form.fee_range_etb} onChange={(e) => set('fee_range_etb', e.target.value)} placeholder="e.g. 50,000 - 120,000  or  Free" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Fee Range (USD/year)</label>
            <input value={form.fee_range_usd} onChange={(e) => set('fee_range_usd', e.target.value)} placeholder="e.g. 900 - 2,200  or  Free" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-base">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Phone</label>
            <input value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="+251 11 123 4567" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} placeholder="info@school.edu.et" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Website</label>
            <input value={form.website || ''} onChange={(e) => set('website', e.target.value)} placeholder="school.edu.et" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Image size={16} /> School Images
          {(form.images || []).length > 0 && (
            <span className="text-xs font-normal text-slate-400">{(form.images || []).length} image{(form.images||[]).length !== 1 ? 's' : ''}</span>
          )}
        </h2>

        {/* Warning about private URLs */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 space-y-1">
          <p className="font-semibold">⚠ Use only publicly accessible image URLs</p>
          <p>Images from school internal systems (like sims.addislearning.edu.et) are blocked and won&apos;t load. Use these instead:</p>
          <ul className="list-disc list-inside space-y-0.5 mt-1">
            <li>Upload to <strong>Google Drive</strong> → right-click → Get shareable link</li>
            <li>Upload to <strong>Cloudinary.com</strong> (free) → copy the direct URL</li>
            <li>Search on <strong>Google Images</strong> → right-click image → Copy image address</li>
            <li>Use <strong>images.unsplash.com</strong> (free high quality)</li>
          </ul>
        </div>

        {/* Image list */}
        {(form.images || []).length > 0 ? (
          <div className="space-y-2">
            {(form.images || []).map((url, i) => (
              <ImageRow
                key={url + i}
                url={url}
                isCover={i === 0}
                onDelete={() => removeImage(i)}
                onSetCover={() => {
                  const imgs = [...(form.images || [])]
                  imgs.splice(i, 1)
                  imgs.unshift(url)
                  set('images', imgs)
                }}
              />
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
            <Image size={28} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No images added yet</p>
            <p className="text-xs mt-1">Paste a public image URL below</p>
          </div>
        )}

        {/* Add image input */}
        <div className="flex gap-2">
          <input
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
            placeholder="Paste public image URL and click Add..."
            className={`flex-1 ${inputCls}`}
          />
          <button
            type="button"
            onClick={addImage}
            disabled={!newImage.trim()}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white text-sm font-medium transition-colors shrink-0"
          >
            <PlusCircle size={14} /> Add
          </button>
        </div>

        <p className="text-xs text-slate-400">
          First image = cover photo shown on cards. Click <strong>Set Cover</strong> to change which image is the cover.
          Click the <strong>red trash</strong> button to delete an image, then click <strong>Save School</strong>.
        </p>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-base">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {(form.tags || []).map((tag) => (
            <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-600">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500">
                <Trash2 size={11} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add tag (e.g. bilingual, sports, STEM)..."
            className={`flex-1 ${inputCls}`}
          />
          <button type="button" onClick={addTag} className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors">
            <PlusCircle size={14} /> Add
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pb-8">
        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
          <Save size={15} /> {saving ? 'Saving...' : 'Save School'}
        </button>
      </div>
    </form>
  )
}
