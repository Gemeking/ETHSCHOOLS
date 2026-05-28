'use client'
import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export interface ToastMsg {
  type: 'success' | 'error'
  text: string
}

interface Props {
  toast: ToastMsg | null
  onClose: () => void
}

export default function Toast({ toast, onClose }: Props) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null

  return (
    <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border text-sm font-semibold max-w-sm animate-in slide-in-from-top-2 duration-200 ${
      toast.type === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      {toast.type === 'success'
        ? <CheckCircle size={16} className="text-emerald-600 shrink-0" />
        : <XCircle size={16} className="text-red-500 shrink-0" />
      }
      <span className="flex-1">{toast.text}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity ml-1">
        <X size={14} />
      </button>
    </div>
  )
}
