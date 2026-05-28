'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPage: (p: number) => void
}

function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  if (current > 3) pages.push('…')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
}

export default function Pagination({ page, totalPages, total, pageSize, onPage }: Props) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to   = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 pt-6 border-t border-slate-200">
      <p className="text-sm text-slate-500 order-2 sm:order-1">
        Showing <span className="font-semibold text-slate-800">{from}–{to}</span> of{' '}
        <span className="font-semibold text-slate-800">{total}</span> results
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={15} /> Prev
        </button>

        {pageWindow(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-2 py-2 text-slate-400 text-sm select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                p === page
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
