import Link from 'next/link'
import { MapPin, BookOpen, Users, CheckCircle, GraduationCap } from 'lucide-react'
import type { University } from '@/lib/types'

interface Props {
  university: University
  featured?: boolean
}

const TYPE_GRADIENT: Record<University['university_type'], string> = {
  public: 'from-emerald-600 to-teal-700',
  private: 'from-blue-600 to-indigo-700',
  faith_based: 'from-amber-600 to-orange-700',
}

const TYPE_BADGE: Record<University['university_type'], string> = {
  public: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  private: 'bg-blue-100 text-blue-700 border-blue-200',
  faith_based: 'bg-amber-100 text-amber-700 border-amber-200',
}

const TYPE_LABEL: Record<University['university_type'], string> = {
  public: 'Public University',
  private: 'Private University',
  faith_based: 'Faith-Based',
}

export default function UniversityCard({ university, featured = false }: Props) {
  const gradient = TYPE_GRADIENT[university.university_type]
  const badge = TYPE_BADGE[university.university_type]
  const totalPrograms = university.departments.reduce((sum, d) => sum + d.programs.length, 0)

  return (
    <Link
      href={`/universities/${university.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 hover:border-primary-200 transition-all duration-300 flex flex-col"
    >
      {/* Banner */}
      <div className={`relative bg-gradient-to-br ${gradient} h-40 flex items-end p-4 overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/10 translate-y-10 -translate-x-10" />

        {university.images?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={university.images[0]}
            alt={university.name_en}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <div className="relative z-10 flex items-center justify-between w-full">
          <span className="text-xs font-semibold text-white/90 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            {university.city}, {university.region}
          </span>
          {university.verified && (
            <span className="flex items-center gap-1 text-xs font-semibold text-white/90 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
              <CheckCircle size={11} /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <span className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full border ${badge} mb-3`}>
          {TYPE_LABEL[university.university_type]}
        </span>

        <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-primary-700 transition-colors line-clamp-2 mb-1">
          {university.name_en}
        </h3>
        <p className="text-xs text-slate-400 mb-3">{university.name_am}</p>

        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <span>{university.city}, {university.region}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BookOpen size={13} className="text-slate-400 shrink-0" />
            <span>{university.departments.length} colleges / {totalPrograms} programs</span>
          </div>
          {university.student_count && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Users size={13} className="text-slate-400 shrink-0" />
              <span>{university.student_count} students</span>
            </div>
          )}
        </div>

        {featured && university.fee_range_etb && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <GraduationCap size={11} />
            <span className={university.fee_range_etb.toLowerCase().includes('free') ? 'text-green-600 font-semibold' : ''}>
              {university.fee_range_etb}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
