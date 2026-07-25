'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, School, LogOut, PlusCircle, Map, Menu, X, BookOpen, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/schools', label: 'Manage Schools', icon: School },
  { href: '/admin/schools/new', label: 'Add School', icon: PlusCircle },
  { href: '/admin/universities', label: 'Manage Universities', icon: BookOpen },
  { href: '/admin/universities/new', label: 'Add University', icon: PlusCircle },
  { href: '/admin/feedback', label: 'User Feedback', icon: Flag },
  { href: '/map', label: 'View Map', icon: Map },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authed, setAuthed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/admin/login') { setAuthed(true); return }
    const ok = localStorage.getItem('admin_auth') === 'true'
    if (!ok) router.replace('/admin/login')
    else setAuthed(true)
  }, [pathname, router])

  function logout() {
    localStorage.removeItem('admin_auth')
    router.push('/admin/login')
  }

  if (!authed) return null
  if (pathname === '/admin/login') return <>{children}</>

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.png" alt="EthioSchool" className="w-9 h-9 object-contain shrink-0" />
          <div>
            <div className="text-white font-bold text-sm">EthioSchool</div>
            <div className="text-slate-400 text-xs">Admin Panel</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive(href, exact)
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={17} /> {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut size={17} /> Sign Out
          </button>
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition-colors mt-1"
          >
            ← Back to website
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 h-14 flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700 p-1">
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-semibold text-slate-700">
            {navItems.find((n) => isActive(n.href, n.exact))?.label || 'Admin'}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
              A
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
