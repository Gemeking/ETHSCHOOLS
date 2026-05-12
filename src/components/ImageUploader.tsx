'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, Star, Link2, PlusCircle, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
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
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const isUploading = pending.some((p) => p.uploading)

  useEffect(() => {
    onUploadingChange?.(isUploading)
  }, [isUploading, onUploadingChange])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => { pending.forEach((p) => URL.revokeObjectURL(p.localUrl)) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function processFiles(files: File[]) {
    const validFiles = files.filter((f) => {
      if (!ACCEPTED.includes(f.type)) return false
      if (f.size > MAX_MB * 1024 * 1024) return false
      return true
    })

    if (validFiles.length === 0) return

    const newPending: PendingUpload[] = validFiles.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      localUrl: URL.createObjectURL(file),
      file,
      uploading: true,
      error: null,
    }))

    setPending((prev) => [...prev, ...newPending])

    // Upload each file
    for (const item of newPending) {
      const { url, error } = await uploadImage(item.file, folder)

      if (error || !url) {
        setPending((prev) =>
          prev.map((p) => p.id === item.id ? { ...p, uploading: false, error: error ?? 'Upload failed' } : p)
        )
      } else {
        // Success: add to confirmed images
        onChange([...images, url])
        // Remove from pending
        setPending((prev) => {
          const updated = prev.filter((p) => p.id !== item.id)
          URL.revokeObjectURL(item.localUrl)
          return updated
        })
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    processFiles(files)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, folder])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  async function removeImage(idx: number) {
    const url = images[idx]
    // Try to delete from storage (only if it's a Supabase storage URL)
    if (url.includes('/storage/v1/object/public/')) {
      deleteStorageImage(url) // fire-and-forget
    }
    onChange(images.filter((_, i) => i !== idx))
  }

  function removePending(id: string) {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id)
      if (item) URL.revokeObjectURL(item.localUrl)
      return prev.filter((p) => p.id !== id)
    })
  }

  function setCover(idx: number) {
    const reordered = [images[idx], ...images.filter((_, i) => i !== idx)]
    onChange(reordered)
  }

  function addUrl() {
    const url = urlInput.trim()
    if (!url) return
    onChange([...images, url])
    setUrlInput('')
    setShowUrlInput(false)
  }

  const total = images.length + pending.length
  const hasImages = total > 0

  return (
    <div className="space-y-4">

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileRef.current?.click()}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200
          ${dragging
            ? 'border-primary-500 bg-primary-50 scale-[1.01]'
            : hasImages
              ? 'border-slate-200 bg-slate-50 hover:border-primary-300 hover:bg-primary-50/30'
              : 'border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50/50'
          }
        `}
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={ACCEPTED.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className={`flex flex-col items-center justify-center gap-3 text-center transition-all ${hasImages ? 'py-5' : 'py-12'}`}>
          <div className={`
            rounded-2xl flex items-center justify-center transition-all
            ${dragging ? 'bg-primary-100 scale-110' : 'bg-white shadow-sm border border-slate-200'}
            ${hasImages ? 'w-10 h-10' : 'w-16 h-16'}
          `}>
            <Upload
              size={hasImages ? 18 : 28}
              className={dragging ? 'text-primary-600' : 'text-slate-400'}
            />
          </div>

          {!hasImages && (
            <>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {dragging ? 'Drop images here' : 'Drop photos here or click to browse'}
                </p>
                <p className="text-xs text-slate-400 mt-1">JPG · PNG · WebP · GIF &nbsp;·&nbsp; Max {MAX_MB} MB each</p>
              </div>
            </>
          )}

          {hasImages && (
            <p className="text-xs font-medium text-slate-500">
              {dragging ? 'Drop to add' : 'Add more photos'}
            </p>
          )}
        </div>
      </div>

      {/* Thumbnails Grid */}
      {hasImages && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">

          {/* Confirmed images */}
          {images.map((url, idx) => (
            <ImageThumb
              key={url + idx}
              url={url}
              isCover={idx === 0}
              onDelete={() => removeImage(idx)}
              onSetCover={() => setCover(idx)}
            />
          ))}

          {/* Pending uploads */}
          {pending.map((item) => (
            <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.localUrl} alt="" className="w-full h-full object-cover" />

              {/* Overlay */}
              <div className={`absolute inset-0 flex items-center justify-center ${item.error ? 'bg-red-900/60' : 'bg-black/40'}`}>
                {item.uploading && (
                  <Loader2 size={22} className="text-white animate-spin" />
                )}
                {item.error && (
                  <div className="flex flex-col items-center gap-1 p-2">
                    <AlertCircle size={18} className="text-red-300" />
                    <p className="text-red-200 text-[10px] text-center leading-tight">Upload failed</p>
                  </div>
                )}
              </div>

              {/* Remove pending */}
              {!item.uploading && (
                <button
                  type="button"
                  onClick={() => removePending(item.id)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-500 transition-colors"
                >
                  <X size={12} className="text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Status + URL option */}
      {hasImages && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            {isUploading
              ? <><Loader2 size={12} className="animate-spin text-primary-500" /> Uploading...</>
              : <><CheckCircle2 size={12} className="text-green-500" /> {images.length} photo{images.length !== 1 ? 's' : ''} ready · First = cover</>
            }
          </span>
          <button
            type="button"
            onClick={() => setShowUrlInput((v) => !v)}
            className="flex items-center gap-1 text-slate-400 hover:text-primary-600 transition-colors"
          >
            <Link2 size={12} /> Add by URL
          </button>
        </div>
      )}

      {/* URL Input (optional) */}
      {showUrlInput && (
        <div className="flex gap-2 animate-fade-in">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
            placeholder="https://example.com/photo.jpg"
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <button
            type="button"
            onClick={addUrl}
            disabled={!urlInput.trim()}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-slate-600 text-white text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-40 shrink-0"
          >
            <PlusCircle size={14} /> Add
          </button>
        </div>
      )}

      {/* Setup hint if first time and no bucket */}
      {!hasImages && (
        <p className="text-xs text-slate-400 text-center">
          First time? Run <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">scripts/create-storage-bucket.sql</code> in Supabase SQL Editor to enable uploads.
        </p>
      )}
    </div>
  )
}

/* ── Individual thumbnail ── */
function ImageThumb({
  url, isCover, onDelete, onSetCover,
}: {
  url: string
  isCover: boolean
  onDelete: () => void
  onSetCover: () => void
}) {
  const [broken, setBroken] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={`relative aspect-square rounded-xl overflow-hidden group cursor-pointer border-2 transition-all ${
        isCover ? 'border-amber-400 shadow-md shadow-amber-100' : 'border-transparent hover:border-primary-300'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !isCover && onSetCover()}
      title={isCover ? 'Cover photo' : 'Click to set as cover'}
    >
      {broken ? (
        <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center gap-1">
          <AlertCircle size={18} className="text-slate-400" />
          <span className="text-[10px] text-slate-400">Broken</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          onError={() => setBroken(true)}
        />
      )}

      {/* Cover badge */}
      {isCover && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500/90 to-transparent px-2 py-1.5 flex items-center gap-1">
          <Star size={10} className="text-white fill-white" />
          <span className="text-white text-[10px] font-bold">Cover</span>
        </div>
      )}

      {/* Set as cover hint (non-cover on hover) */}
      {!isCover && hovered && (
        <div className="absolute inset-0 bg-primary-900/60 flex items-center justify-center">
          <span className="text-white text-[11px] font-semibold text-center px-2">Set as cover</span>
        </div>
      )}

      {/* Delete button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
      >
        <X size={12} className="text-white" />
      </button>
    </div>
  )
}
