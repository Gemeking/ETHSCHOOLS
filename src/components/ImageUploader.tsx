'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Upload, X, Star, Link2, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Trash2, Eye, ImageOff, Plus,
} from 'lucide-react'
import { uploadImage, deleteStorageImage } from '@/lib/supabase-storage'

interface PendingUpload {
  id: string
  localUrl: string
  file: File
  uploading: boolean
  error: string | null
}

interface Props {
  images: string[]
  onChange: (images: string[]) => void
  folder: 'schools' | 'universities'
  onUploadingChange?: (uploading: boolean) => void
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_MB = 10

export default function ImageUploader({ images, onChange, folder, onUploadingChange }: Props) {
  const [pending, setPending] = useState<PendingUpload[]>([])
  const [dragging, setDragging] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [urlPreview, setUrlPreview] = useState('')
  const [showUrlPanel, setShowUrlPanel] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const isUploading = pending.some((p) => p.uploading)

  useEffect(() => { onUploadingChange?.(isUploading) }, [isUploading, onUploadingChange])
  useEffect(() => {
    return () => { pending.forEach((p) => URL.revokeObjectURL(p.localUrl)) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Lightbox keyboard nav
  useEffect(() => {
    if (lightbox === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') setLightbox(i => i !== null ? Math.min(i + 1, images.length - 1) : null)
      if (e.key === 'ArrowLeft')  setLightbox(i => i !== null ? Math.max(i - 1, 0) : null)
      if (e.key === 'Escape')     setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, images.length])

  async function processFiles(files: File[]) {
    const valid = files.filter(f => ACCEPTED.includes(f.type) && f.size <= MAX_MB * 1024 * 1024)
    if (!valid.length) return

    const newPending: PendingUpload[] = valid.map(file => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      localUrl: URL.createObjectURL(file),
      file, uploading: true, error: null,
    }))
    setPending(prev => [...prev, ...newPending])

    for (const item of newPending) {
      const { url, error } = await uploadImage(item.file, folder)
      if (error || !url) {
        setPending(prev => prev.map(p => p.id === item.id ? { ...p, uploading: false, error: error ?? 'Upload failed' } : p))
      } else {
        onChange([...images, url])
        setPending(prev => { const u = prev.filter(p => p.id !== item.id); URL.revokeObjectURL(item.localUrl); return u })
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files ?? []))
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    processFiles(Array.from(e.dataTransfer.files))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, folder])

  function removeImage(idx: number) {
    const url = images[idx]
    if (url.includes('/storage/v1/object/public/')) deleteStorageImage(url)
    onChange(images.filter((_, i) => i !== idx))
    if (lightbox !== null) setLightbox(null)
  }

  function setCover(idx: number) {
    onChange([images[idx], ...images.filter((_, i) => i !== idx)])
  }

  function moveLeft(idx: number) {
    if (idx === 0) return
    const arr = [...images]
    ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
    onChange(arr)
  }

  function moveRight(idx: number) {
    if (idx === images.length - 1) return
    const arr = [...images]
    ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
    onChange(arr)
  }

  function addUrl() {
    const url = urlPreview.trim() || urlInput.trim()
    if (!url) return
    onChange([...images, url])
    setUrlInput(''); setUrlPreview(''); setShowUrlPanel(false)
  }

  const hasImages = images.length + pending.length > 0

  return (
    <div className="space-y-5">

      {/* ── Current images grid ── */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {images.length} photo{images.length !== 1 ? 's' : ''} · First = cover
            </p>
            <span className="text-[11px] text-slate-400">Click image to preview · arrows to reorder</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((url, idx) => (
              <ImageCard
                key={url + idx}
                url={url}
                isCover={idx === 0}
                canMoveLeft={idx > 0}
                canMoveRight={idx < images.length - 1}
                onPreview={() => setLightbox(idx)}
                onDelete={() => removeImage(idx)}
                onSetCover={() => setCover(idx)}
                onMoveLeft={() => moveLeft(idx)}
                onMoveRight={() => moveRight(idx)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Pending uploads ── */}
      {pending.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {pending.map(item => (
            <div key={item.id} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.localUrl} alt="" className="w-full h-full object-cover opacity-60" />
              <div className={`absolute inset-0 flex items-center justify-center ${item.error ? 'bg-red-900/60' : 'bg-black/40'}`}>
                {item.uploading
                  ? <div className="flex flex-col items-center gap-2">
                      <Loader2 size={24} className="text-white animate-spin" />
                      <span className="text-white text-xs font-medium">Uploading…</span>
                    </div>
                  : item.error
                    ? <div className="flex flex-col items-center gap-1 p-2">
                        <AlertCircle size={20} className="text-red-300" />
                        <p className="text-red-200 text-[11px] text-center">Failed</p>
                        <button type="button" onClick={() => setPending(p => p.filter(x => x.id !== item.id))} className="text-red-300 hover:text-white text-[10px] underline mt-1">Remove</button>
                      </div>
                    : null
                }
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Upload drop zone + Add URL ── */}
      <div className="flex gap-3">

        {/* Drop zone / upload button */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileRef.current?.click()}
          className={`
            flex-1 cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 flex items-center justify-center gap-3 py-5 px-4
            ${dragging
              ? 'border-primary-500 bg-primary-50 scale-[1.01]'
              : 'border-slate-200 bg-slate-50 hover:border-primary-400 hover:bg-primary-50/40'
            }
          `}
        >
          <input ref={fileRef} type="file" multiple accept={ACCEPTED.join(',')} onChange={handleFileInput} className="hidden" />
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${dragging ? 'bg-primary-100' : 'bg-white border border-slate-200'}`}>
            <Upload size={18} className={dragging ? 'text-primary-600' : 'text-slate-400'} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">{dragging ? 'Drop to upload' : hasImages ? 'Upload more photos' : 'Upload photos'}</p>
            <p className="text-xs text-slate-400 mt-0.5">JPG · PNG · WebP · Max {MAX_MB} MB each</p>
          </div>
        </div>

        {/* Add by URL button */}
        <button
          type="button"
          onClick={() => setShowUrlPanel(v => !v)}
          className={`flex flex-col items-center justify-center gap-1.5 px-5 rounded-2xl border-2 border-dashed transition-all duration-200 shrink-0
            ${showUrlPanel
              ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
              : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-500 hover:text-indigo-600'
            }`}
        >
          <Link2 size={18} />
          <span className="text-xs font-semibold">Add URL</span>
        </button>
      </div>

      {/* ── URL panel ── */}
      {showUrlPanel && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-3 animate-fade-in">
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Add image by URL</p>
          <div className="flex gap-2">
            <input
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setUrlPreview('') }}
              onBlur={() => { if (urlInput.trim()) setUrlPreview(urlInput.trim()) }}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), setUrlPreview(urlInput.trim()))}
              placeholder="https://example.com/school-photo.jpg"
              className="flex-1 border border-indigo-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            />
            <button
              type="button"
              onClick={() => setUrlPreview(urlInput.trim())}
              className="px-4 py-2.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-semibold transition-colors shrink-0"
            >
              Preview
            </button>
          </div>

          {urlPreview && (
            <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-indigo-200 max-h-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlPreview}
                alt="Preview"
                className="w-full h-48 object-cover"
                onError={() => setUrlPreview('')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-3">
                <span className="text-white text-xs font-medium truncate max-w-full">{urlPreview}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setShowUrlPanel(false); setUrlInput(''); setUrlPreview('') }} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button
              type="button"
              onClick={addUrl}
              disabled={!urlInput.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-40"
            >
              <Plus size={14} /> Add Image
            </button>
          </div>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox !== null && images[lightbox] && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-white text-sm font-medium">
            {lightbox + 1} / {images.length}
            {lightbox === 0 && <span className="ml-2 text-amber-400 text-xs font-bold">★ Cover</span>}
          </div>

          {/* Prev arrow */}
          {lightbox > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Next arrow */}
          {lightbox < images.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Main image */}
          <div className="max-w-4xl max-h-[80vh] mx-16" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightbox]}
              alt=""
              className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
            />
          </div>

          {/* Bottom action bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            {lightbox !== 0 && (
              <button
                type="button"
                onClick={() => { setCover(lightbox); setLightbox(0) }}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg"
              >
                <Star size={14} fill="currentColor" /> Set as Cover
              </button>
            )}
            <button
              type="button"
              onClick={() => { removeImage(lightbox); setLightbox(null) }}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2" onClick={e => e.stopPropagation()}>
              {images.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightbox(i)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === lightbox ? 'border-white scale-110' : 'border-white/30 opacity-60 hover:opacity-100'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Image card ── */
function ImageCard({
  url, isCover, canMoveLeft, canMoveRight,
  onPreview, onDelete, onSetCover, onMoveLeft, onMoveRight,
}: {
  url: string
  isCover: boolean
  canMoveLeft: boolean
  canMoveRight: boolean
  onPreview: () => void
  onDelete: () => void
  onSetCover: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
}) {
  const [broken, setBroken] = useState(false)

  return (
    <div className={`group relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
      isCover
        ? 'border-amber-400 shadow-lg shadow-amber-100'
        : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
    }`}>

      {/* Image */}
      {broken ? (
        <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-2">
          <ImageOff size={22} className="text-slate-300" />
          <span className="text-[11px] text-slate-400 font-medium">Broken link</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setBroken(true)}
        />
      )}

      {/* Cover ribbon */}
      {isCover && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-amber-500/80 to-transparent px-2.5 py-2 flex items-center gap-1">
          <Star size={11} className="text-white fill-white" />
          <span className="text-white text-[11px] font-bold tracking-wide">COVER</span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <button type="button" onClick={onPreview} title="Preview"
          className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
          <Eye size={16} />
        </button>
        {!isCover && (
          <button type="button" onClick={onSetCover} title="Set as cover"
            className="w-9 h-9 rounded-xl bg-amber-500/80 hover:bg-amber-500 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
            <Star size={16} />
          </button>
        )}
        <button type="button" onClick={onDelete} title="Delete"
          className="w-9 h-9 rounded-xl bg-red-500/80 hover:bg-red-500 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      {/* Reorder arrows — bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" onClick={onMoveLeft} disabled={!canMoveLeft}
          className="flex-1 bg-black/60 hover:bg-indigo-600 disabled:opacity-20 disabled:cursor-not-allowed text-white flex items-center justify-center py-1.5 transition-colors">
          <ChevronLeft size={15} />
        </button>
        <button type="button" onClick={onMoveRight} disabled={!canMoveRight}
          className="flex-1 bg-black/60 hover:bg-indigo-600 disabled:opacity-20 disabled:cursor-not-allowed text-white flex items-center justify-center py-1.5 transition-colors border-l border-white/10">
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
