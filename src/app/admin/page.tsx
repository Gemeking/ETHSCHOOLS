import Link from 'next/link'
import { Globe, Lock, Building2, PlusCircle, School, ArrowRight } from 'lucide-react'
import { stats, schools } from '@/lib/data'

export default function AdminDashboard() {
  const recent = schools.slice(0, 5)

  const statCards = [
    { label: 'Total Schools', value: stats.total, icon: School, color: 'bg-slate-100 text-slate-600', border: 'border-slate-200' },
    { label: 'International', value: stats.international, icon: Globe, color: 'bg-violet-100 text-violet-700', border: 'border-violet-200' },
    { label: 'Private', value: stats.private, icon: Lock, color: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
    { label: 'Public', value: stats.public, icon: Building2, color: 'bg-green-100 text-green-700', border: 'border-green-200' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of all schools in the EthioSchool database</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`bg-white rounded-2xl border ${border} p-5`}>
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={18} />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/schools/new"
          className="flex items-center gap-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl p-5 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <PlusCircle size={22} />
          </div>
          <div>
            <div className="font-bold text-lg">Add New School</div>
            <div className="text-primary-100 text-sm">Add a school to the database</div>
          </div>
          <ArrowRight size={18} className="ml-auto group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/schools"
          className="flex items-center gap-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl p-5 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <School size={22} className="text-slate-600" />
          </div>
          <div>
            <div className="font-bold text-lg">Manage Schools</div>
            <div className="text-slate-500 text-sm">Edit or delete existing schools</div>
          </div>
          <ArrowRight size={18} className="ml-auto group-hover:translate-x-1 transition-transform text-slate-400" />
        </Link>
      </div>

      {/* Recent schools table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Schools</h2>
          <Link href="/admin/schools" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recent.map((school) => (
            <div key={school.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 ${
                school.school_type === 'international' ? 'bg-violet-600' :
                school.school_type === 'private' ? 'bg-blue-600' : 'bg-green-600'
              }`}>
                {school.name_en.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 truncate">{school.name_en}</div>
                <div className="text-xs text-slate-400">{school.sub_city} · {school.school_type}</div>
              </div>
              <Link
                href={`/admin/schools/${school.id}/edit`}
                className="text-xs text-slate-400 hover:text-primary-600 font-medium shrink-0"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>Connect Supabase</strong> to enable persistent storage, real-time updates, and image uploads.
        Update your <code className="bg-blue-100 px-1 rounded">.env.local</code> with your Supabase credentials.
      </div>
    </div>
  )
}
