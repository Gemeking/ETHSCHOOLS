'use client'
import { useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, QrCode, X, Share2 } from 'lucide-react'

interface Props {
  url: string
  name: string
  type?: 'school' | 'university'
}

export default function QRCodeCard({ url, name, type = 'school' }: Props) {
  const [open, setOpen] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const accent = type === 'university' ? '#059669' : '#4f46e5'
  const lightBg = type === 'university' ? '#ecfdf5' : '#eef2ff'

  function downloadQR() {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return

    // Create a padded export canvas
    const pad = 24
    const size = canvas.width
    const out = document.createElement('canvas')
    out.width  = size + pad * 2
    out.height = size + pad * 2 + 48
    const ctx = out.getContext('2d')!

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.roundRect(0, 0, out.width, out.height, 16)
    ctx.fill()

    // QR code
    ctx.drawImage(canvas, pad, pad)

    // Name label
    ctx.fillStyle = '#1e293b'
    ctx.font = 'bold 13px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(
      name.length > 40 ? name.slice(0, 38) + '…' : name,
      out.width / 2,
      size + pad * 2 + 18
    )

    // URL label
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
      alert('Link copied to clipboard!')
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 text-sm font-semibold transition-all duration-200 shadow-sm group"
      >
        <QrCode size={16} className="group-hover:scale-110 transition-transform" />
        QR Code
      </button>

      {/* Modal */}
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
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: lightBg }}>
                  <QrCode size={16} style={{ color: accent }} />
                </div>
                <span className="font-bold text-slate-900 text-sm">QR Code</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* QR code */}
            <div className="flex flex-col items-center px-6 py-6 gap-4">
              <div
                ref={canvasRef}
                className="p-4 rounded-2xl border-2 shadow-inner"
                style={{ borderColor: lightBg, background: '#fafafa' }}
              >
                <QRCodeCanvas
                  value={url}
                  size={200}
                  level="H"
                  fgColor="#0f172a"
                  bgColor="#fafafa"
                  imageSettings={{
                    src: '/favicon.ico',
                    height: 28,
                    width: 28,
                    excavate: true,
                  }}
                />
              </div>

              <div className="text-center space-y-1 max-w-full">
                <p className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">{name}</p>
                <p className="text-xs text-slate-400 truncate max-w-[260px]">{url}</p>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Scan to open this profile · Download to share
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 px-5 pb-5">
              <button
                onClick={downloadQR}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: accent }}
              >
                <Download size={16} /> Download PNG
              </button>
              <button
                onClick={shareQR}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
              >
                <Share2 size={16} /> Share Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
