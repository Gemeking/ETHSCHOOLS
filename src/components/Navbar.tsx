'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GraduationCap, Map, School, Shield, Menu, X, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/schools',      label: 'Schools',      icon: School   },
  { href: '/universities', label: 'Universities',  icon: BookOpen },
  { href: '/map',          label: 'Map View',      icon: Map      },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200 group-hover:shadow-emerald-300 transition-all duration-200">
              <GraduationCap size={19} className="text-white" />
            </div>
            <span className="font-extrabold text-[18px] tracking-tight text-slate-900">
              Ethio<span className="text-emerald-600">School</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                    active
                      ? 'text-indigo-700 bg-indigo-50'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <Icon size={15} />
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-500 rounded-full" />
                  )}
                </Link>
              )
            })}

            <div className="w-px h-5 bg-slate-200 mx-2" />

            <Link
              href="/admin"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-200"
            >
              <Shield size={13} />
              Admin
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white/98 backdrop-blur-md px-4 py-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                pathname.startsWith(href)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon size={17} /> {label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-50"
          >
            <Shield size={17} /> Admin
          </Link>
        </div>
      )}
    </nav>
  )
}
