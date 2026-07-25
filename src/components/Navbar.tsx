'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, School, Menu, X, BookOpen, Wrench, Flag } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // useSearchParams is deliberately avoided here — it forces every page that
  // renders the Navbar to bail out of static rendering (bad for SEO).
  const isTvet = pathname.startsWith('/schools/type/tvet')

  const links = [
    { href: '/schools',            label: 'Schools',     icon: School,   active: pathname.startsWith('/schools') && !isTvet },
    { href: '/schools/type/tvet',  label: 'TVET',        icon: Wrench,   active: isTvet,                                     orange: true },
    { href: '/universities',      label: 'Universities', icon: BookOpen, active: pathname.startsWith('/universities') },
    { href: '/map',               label: 'Map View',     icon: Map,      active: pathname.startsWith('/map') },
  ]

  return (
    <nav className="sticky top-9 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.png" alt="EthioSchool" className="w-9 h-9 object-contain shrink-0" />
            <span className="font-extrabold text-[18px] tracking-tight text-slate-900">
              Ethio<span className="text-emerald-600">School</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map(({ href, label, icon: Icon, active, orange }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                  active && orange  ? 'text-orange-700 bg-orange-50' :
                  active            ? 'text-indigo-700 bg-indigo-50' :
                                      'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <Icon size={15} />
                {label}
                {active && (
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full ${orange ? 'bg-orange-500' : 'bg-indigo-500'}`} />
                )}
              </Link>
            ))}
            <Link
              href="/report"
              className="flex items-center gap-1.5 ml-1.5 pl-3 pr-3.5 py-2 rounded-xl text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
            >
              <Flag size={14} /> Report
            </Link>
          </div>

          {/* Mobile: report button + menu toggle */}
          <div className="flex md:hidden items-center gap-1.5">
            <Link
              href="/report"
              className="flex items-center justify-center w-9 h-9 rounded-xl text-amber-700 bg-amber-50 border border-amber-200"
              aria-label="Report an issue"
            >
              <Flag size={16} />
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white/98 backdrop-blur-md px-4 py-3 space-y-1">
          {links.map(({ href, label, icon: Icon, active, orange }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                active && orange  ? 'bg-orange-50 text-orange-700' :
                active            ? 'bg-indigo-50 text-indigo-700' :
                                    'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon size={17} /> {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
