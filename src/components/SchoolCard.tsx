import Link from 'next/link'
import { MapPin, BookOpen, ArrowRight, CheckCircle } from 'lucide-react'
import type { School } from '@/lib/types'
import { typeGradient, typeLabel, formatFee } from '@/lib/utils'

interface Props {
  school: School
  featured?: boolean
  index?: number
}

export default function SchoolCard({ school, index = 0 }: Props) {
  const gradient = typeGradient(school.school_type)

  const typeDot: Record<School['school_type'], string> = {
    international: 'bg-violet-500',
    private:       'bg-cyan-500',
    public:        'bg-emerald-500',
    tvet:          'bg-orange-500',
  }

  return (
    <Link
      href={`/schools/${school.id}`}
      className="group relative bg-white rounded-2xl overflow-hidden border border-white/80 hover:border-indigo-200 shadow-[0_2px_16px_rgba(79,70,229,0.06)] hover:shadow-[0_12px_40px_rgba(79,70,229,0.16)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col card-animate"
      style={{ '--delay': `${Math.min(index, 18) * 50}ms` } as React.CSSProperties}
    >
      {/* Gradient header */}
      <div className={`relative bg-gradient-to-br ${gradient} h-44 overflow-hidden flex-shrink-0`}>
        {/* Texture circles */}
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-4 w-28 h-28 rounded-full bg-black/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white/5" />

        {/* Cover image */}
        {school.images?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={school.images[0]}
            alt={school.name_en}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Top badges */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <span className="text-[10px] font-bold text-white/90 bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded-full tracking-wider">
            {typeLabel(school.school_type).toUpperCase()}
          </span>
          {school.verified && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-500/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <CheckCircle size={9} /> Verified
            </span>
          )}
        </div>

        {/* School initial — bottom left */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-2xl font-black shadow-lg">
            {school.name_en.charAt(0)}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5">
        {/* Name */}
        <h3 className="font-bold text-slate-900 text-[15px] leading-snug group-hover:text-indigo-700 transition-colors duration-200 line-clamp-2 mb-0.5">
          {school.name_en}
        </h3>
        {school.name_am && (
          <p className="text-xs text-slate-400 mb-4 font-medium">{school.name_am}</p>
        )}

        {/* Info rows */}
        <div className="mt-auto space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
              <MapPin size={11} className="text-slate-400" />
            </div>
            <span className="text-sm text-slate-500 font-medium">{school.sub_city}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
              <BookOpen size={11} className="text-slate-400" />
            </div>
            <span className="text-sm text-slate-500 line-clamp-1">{school.curriculum}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Annual Fee</div>
            <div className="text-sm font-bold text-slate-800">{formatFee(school.fee_range_etb)}</div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-indigo-600 flex items-center justify-center transition-all duration-300 shrink-0">
            <ArrowRight size={14} className="text-slate-400 group-hover:text-white -translate-x-0.5 group-hover:translate-x-0 transition-all duration-300" />
          </div>
        </div>
      </div>

      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${typeDot[school.school_type]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </Link>
  )
}
