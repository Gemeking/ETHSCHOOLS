import Link from 'next/link'
import { MapPin, BookOpen, DollarSign, CheckCircle, Phone } from 'lucide-react'
import type { School } from '@/lib/types'
import { typeColor, typeGradient, typeLabel, formatFee } from '@/lib/utils'

interface Props {
  school: School
  featured?: boolean
}

export default function SchoolCard({ school, featured = false }: Props) {
  const gradient = typeGradient(school.school_type)
  const badge = typeColor(school.school_type)

  return (
    <Link
      href={`/schools/${school.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 hover:border-primary-200 transition-all duration-300 flex flex-col"
    >
      {/* Image / Gradient Banner */}
      <div className={`relative bg-gradient-to-br ${gradient} h-40 flex items-end p-4 overflow-hidden`}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/10 translate-y-10 -translate-x-10" />

        {school.images?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={school.images[0]}
            alt={school.name_en}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <div className="relative z-10 flex items-center justify-between w-full">
          <span className="text-xs font-semibold text-white/90 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            Est. {school.established}
          </span>
          {school.verified && (
            <span className="flex items-center gap-1 text-xs font-semibold text-white/90 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
              <CheckCircle size={11} /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Type badge */}
        <span className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full border ${badge} mb-3`}>
          {typeLabel(school.school_type)}
        </span>

        {/* Name */}
        <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-primary-700 transition-colors line-clamp-2 mb-1">
          {school.name_en}
        </h3>
        <p className="text-xs text-slate-400 mb-3">{school.name_am}</p>

        {/* Details */}
        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <span>{school.sub_city}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <BookOpen size={13} className="text-slate-400 shrink-0" />
            <span className="line-clamp-1">{school.curriculum}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <DollarSign size={13} className="text-primary-500 shrink-0" />
            <span>{formatFee(school.fee_range_etb)}</span>
          </div>
        </div>

        {featured && school.phone && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
            <Phone size={11} />
            <span>{school.phone}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
