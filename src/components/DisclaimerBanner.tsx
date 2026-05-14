'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle, X, ExternalLink, Send } from 'lucide-react'

const STORAGE_KEY = 'ethschools_disclaimer_dismissed'

export default function DisclaimerBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9998] px-3 pb-3 sm:px-4 sm:pb-4 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden">

          {/* Top accent stripe */}
          <div className="h-1 w-full flex">
            <div className="flex-1 bg-amber-400" />
            <div className="flex-1 bg-green-500" />
            <div className="flex-1 bg-red-500" />
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex gap-3">

              {/* Icon */}
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={16} className="text-amber-600" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 mb-0.5">
                  Data Accuracy Notice
                </p>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  Not all information on EthioSchools is 100% verified. Only listings marked with a{' '}
                  <span className="inline-flex items-center gap-0.5 text-green-700 font-semibold">
                    <span className="w-3 h-3 rounded-full bg-green-100 inline-flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600 block" />
                    </span>
                    Verified
                  </span>{' '}
                  badge are confirmed accurate. Always contact the school or university directly to confirm fees, programs, and other details.
                </p>

                {/* Action links */}
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://t.me/abrolabs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#229ED9] text-white text-xs font-semibold hover:bg-[#1a8bc4] transition-colors"
                  >
                    <Send size={11} /> Contact us on Telegram
                  </a>
                  <a
                    href="https://t.me/abrolabs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    <ExternalLink size={11} /> Register your school
                  </a>
                  <a
                    href="https://t.me/abrolabs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                  >
                    Report wrong info
                  </a>
                  <a
                    href="https://t.me/abrolabs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                  >
                    Need a website? We build it
                  </a>
                </div>
              </div>

              {/* Dismiss */}
              <button
                onClick={dismiss}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
