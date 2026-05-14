'use client'
import { useState } from 'react'
import { AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react'

export default function DisclaimerBanner() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-[9998] flex flex-col items-end gap-0">

      {/* Expanded panel */}
      {expanded && (
        <div className="mb-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/15 overflow-hidden">
          <div className="h-0.5 w-full flex">
            <div className="flex-1 bg-amber-400" />
            <div className="flex-1 bg-green-500" />
            <div className="flex-1 bg-red-500" />
          </div>
          <div className="p-4">
            <p className="text-xs font-bold text-slate-800 mb-1">Data Accuracy Notice</p>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Not everything here is 100% correct. Only{' '}
              <span className="text-green-700 font-semibold">✓ Verified</span> listings are confirmed accurate.
              Always confirm details directly with the school.
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                { label: '📩 Contact us on Telegram',     href: 'https://t.me/abrolabs', cls: 'bg-[#229ED9]/10 text-[#1a8bc4] hover:bg-[#229ED9]/20' },
                { label: '🏫 Register your school',       href: 'https://t.me/abrolabs', cls: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
                { label: '⚠️ Report wrong info',           href: 'https://t.me/abrolabs', cls: 'bg-red-50 text-red-600 hover:bg-red-100' },
                { label: '💻 Need a website? We build it', href: 'https://t.me/abrolabs', cls: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
              ].map(({ label, href, cls }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${cls}`}
                >
                  {label}
                </a>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">Telegram: @abrolabs</p>
          </div>
        </div>
      )}

      {/* Glowing pill button — always visible, never dismissible */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm
          bg-amber-500 text-white border-2 border-amber-400
          shadow-[0_0_16px_4px_rgba(245,158,11,0.55)]
          hover:shadow-[0_0_24px_8px_rgba(245,158,11,0.7)]
          hover:bg-amber-400
          active:scale-95
          transition-all duration-200"
      >
        <AlertTriangle size={15} className="shrink-0" />
        Notice
        {expanded
          ? <ChevronDown size={13} />
          : <ChevronUp   size={13} />
        }
      </button>
    </div>
  )
}
