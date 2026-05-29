'use client'
import { useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, QrCode, X, Share2, Check } from 'lucide-react'

interface Props {
  url: string
  name: string
  type?: 'school' | 'university'
}

export default function QRCodeCard({ url, name, type = 'school' }: Props) {
  const [open, setOpen]       = useState(false)
  const [copied, setCopied]   = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const isUni   = type === 'university'
  const accent  = isUni ? '#059669' : '#4f46e5'
  const lightBg = isUni ? '#ecfdf5' : '#eef2ff'
  const gradient = isUni
    ? 'from-emerald-500 to-teal-600'
    : 'from-indigo-500 to-violet-600'
  const glow = isUni
    ? 'shadow-[0_0_20px_4px_rgba(5,150,105,0.45)]'
    : 'shadow-[0_0_20px_4px_rgba(79,70,229,0.45)]'
  const hoverGlow = isUni
    ? 'hover:shadow-[0_0_28px_8px_rgba(5,150,105,0.6)]'
    : 'hover:shadow-[0_0_28px_8px_rgba(79,70,229,0.6)]'

  function downloadQR() {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const pad = 24
    const size = canvas.width
    const out = document.createElement('canvas')
    out.width  = size + pad * 2
    out.height = size + pad * 2 + 48
    const ctx = out.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.roundRect(0, 0, out.width, out.height, 16)
    ctx.fill()
    ctx.drawImage(canvas, pad, pad)
    ctx.fillStyle = '#1e293b'
    ctx.font = 'bold 13px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(name.length > 40 ? name.slice(0, 38) + '…' : name, out.width / 2, size + pad * 2 + 18)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '10px system-ui, sans-serif'
    ctx.fillText(url, out.width / 2, size + pad * 2 + 36)
    const link = document.createElement('a')
    link.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.png`
    link.href = out.toDataURL('image/png')
    link.click()
  }

  async function shareQR() {
    if (navigator.share) {
      await navigator.share({ title: name, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <>
      {/* ── Trigger button — bold glowing gradient ── */}
      <button
        onClick={() => setOpen(true)}
        className={`
          relative flex items-center gap-2 px-5 py-2.5 rounded-2xl
          bg-gradient-to-r ${gradient} text-white
          text-sm font-bold tracking-wide
          ${glow} ${hoverGlow}
          hover:scale-105 active:scale-95
          transition-all duration-200
          overflow-hidden group
        `}
      >
        {/* Shimmer sweep */}
        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12 pointer-events-none" />
        <QrCode size={17} className="shrink-0 group-hover:rotate-6 transition-transform duration-200" />
        <span>QR Code</span>
      </button>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${gradient} px-5 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <QrCode size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-none">QR Code</p>
                  <p className="text-white/70 text-xs mt-0.5">Scan to open this profile</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* QR code */}
            <div className="flex flex-col items-center px-6 py-6 gap-4">
              <div
                ref={canvasRef}
                className="p-4 rounded-2xl border-2 shadow-lg"
                style={{ borderColor: lightBg, background: '#fafafa' }}
              >
                <QRCodeCanvas
                  value={url}
                  size={200}
                  level="H"
                  fgColor={accent}
                  bgColor="#fafafa"
                  imageSettings={{
                    src: '/favicon.ico',
                    height: 30,
                    width: 30,
                    excavate: true,
                  }}
                />
              </div>

              <div className="text-center space-y-1 max-w-full">
                <p className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">{name}</p>
                <p className="text-xs text-slate-400 truncate max-w-[260px]">{url}</p>
              </div>

              {/* Copied inline notice */}
              {copied && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                  <Check size={12} /> Link copied to clipboard!
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 px-5 pb-5">
              <button
                onClick={downloadQR}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 shadow-md"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
              >
                <Download size={16} /> Download
              </button>
              <button
                onClick={shareQR}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm border-2 transition-all active:scale-95 hover:bg-slate-50"
                style={{ borderColor: lightBg, color: accent }}
              >
                {copied ? <><Check size={16} /> Copied!</> : <><Share2 size={16} /> Share Link</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
