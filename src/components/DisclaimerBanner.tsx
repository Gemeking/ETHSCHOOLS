'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle, X, Send, ChevronUp, ChevronDown } from 'lucide-react'

const STORAGE_KEY = 'ethschools_disclaimer_v2'

export default function DisclaimerBanner() {
  const [visible, setVisible]   = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9998] flex flex-col items-end gap-0">

      {/* Expanded panel */}
      {expanded && (
        <div className="mb-1 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/15 overflow-hidden">
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
                { label: '📩 Contact us on Telegram', href: 'https://t.me/abrolabs', cls: 'bg-[#229ED9]/10 text-[#1a8bc4] hover:bg-[#229ED9]/20' },
                { label: '🏫 Register your school',   href: 'https://t.me/abrolabs', cls: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
                { label: '⚠️ Report wrong info',       href: 'https://t.me/abrolabs', cls: 'bg-red-50 text-red-600 hover:bg-red-100' },
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

      {/* Collapsed pill / toggle button */}
      <div className="flex items-center gap-1">
        {expanded && (
          <button
            onClick={dismiss}
            className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors"
            aria-label="Dismiss"
          >
            <X size={12} />
          </button>
        )}
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 pl-2.5 pr-3 h-8 rounded-full bg-white border border-slate-200 shadow-md text-slate-600 hover:border-amber-300 hover:text-amber-700 transition-all text-xs font-semibold"
        >
          <AlertTriangle size={12} className="text-amber-500 shrink-0" />
          <span>Notice</span>
          {expanded
            ? <ChevronDown size={11} className="text-slate-400" />
            : <ChevronUp   size={11} className="text-slate-400" />
          }
        </button>
      </div>
    </div>
  )
}
