'use client'
import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, Star } from 'lucide-react'

interface Props {
  images: string[]
  name: string
}

export default function PhotoGallery({ images, name }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const prev = useCallback(() => {
    setLightbox(i => (i === null ? null : (i - 1 + images.length) % images.length))
  }, [images.length])

  const next = useCallback(() => {
    setLightbox(i => (i === null ? null : (i + 1) % images.length))
  }, [images.length])

  useEffect(() => {
    if (lightbox === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, prev, next])

  if (!images.length) return null

  const [cover, ...rest] = images

  return (
    <>
      {/* Grid */}
      <div className="space-y-2">
        {/* Cover image — full width */}
        <div
          className="relative w-full aspect-video rounded-xl overflow-hidden cursor-zoom-in group"
          onClick={() => setLightbox(0)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={`${name} cover`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          <span className="absolute top-2 left-2 flex items-center gap-1 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            <Star size={9} fill="white" /> Cover
          </span>
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/50 text-white rounded-lg p-1.5">
              <ZoomIn size={14} />
            </div>
          </div>
        </div>

        {/* Rest — 3-column grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {rest.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-xl overflow-hidden cursor-zoom-in group"
                onClick={() => setLightbox(i + 1)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${name} photo ${i + 2}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-400 text-right">{images.length} photo{images.length !== 1 ? 's' : ''} · click to enlarge</p>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          {/* Image */}
          <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightbox]}
              alt={`${name} photo ${lightbox + 1}`}
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl"
            />

            {/* Cover badge in lightbox */}
            {lightbox === 0 && (
              <span className="absolute top-3 left-3 flex items-center gap-1 bg-amber-400 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                <Star size={10} fill="white" /> Cover photo
              </span>
            )}

            {/* Counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full font-medium">
              {lightbox + 1} / {images.length}
            </div>
          </div>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={22} />
            </button>
          )}

          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-2 bg-black/40 rounded-2xl">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setLightbox(i) }}
                  className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === lightbox ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-90'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
