import { notFound } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  MapPin, Phone, Mail, Globe, BookOpen, Users, Calendar,
  CheckCircle, ArrowLeft, ExternalLink, DollarSign, Languages
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SchoolCard from '@/components/SchoolCard'
import QRCodeCard from '@/components/QRCodeCard'
import { schools } from '@/lib/data'
import { fetchSchoolById, fetchAllSchools } from '@/lib/supabase-data'
import { typeColor, typeGradient, typeLabel, formatFee } from '@/lib/utils'

const BASE_URL = 'https://ethschools.vercel.app'

export const revalidate = 60

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-200 animate-pulse rounded-2xl" />,
})

export function generateStaticParams() {
  return schools.map((s) => ({ id: String(s.id) }))
}

export default async function SchoolDetailPage({ params }: { params: { id: string } }) {
  const school = await fetchSchoolById(Number(params.id))
  if (!school) notFound()

  const gradient = typeGradient(school.school_type)
  const badge = typeColor(school.school_type)
  const allSchools = await fetchAllSchools()
  const related = allSchools.filter((s) => s.id !== school.id && s.sub_city === school.sub_city).slice(0, 3)

  const infoItems = [
    { icon: BookOpen, label: 'Curriculum', value: school.curriculum },
    { icon: Users, label: 'Grades', value: school.grades },
    { icon: Languages, label: 'Language', value: school.language },
    { icon: MapPin, label: 'Sub-city', value: `${school.sub_city}${school.woreda ? `, Woreda ${school.woreda}` : ''}` },
    { icon: Calendar, label: 'Established', value: school.established ? `${school.established}` : 'N/A' },
    { icon: DollarSign, label: 'Annual Fees', value: formatFee(school.fee_range_etb) },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero banner */}
      <div className={`relative bg-gradient-to-br ${gradient} h-48 sm:h-64 overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/10" />
        </div>
        {school.images?.[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={school.images[0]} alt={school.name_en} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-between py-6">
          <Link href="/schools" className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors w-fit">
            <ArrowLeft size={16} /> Back to Schools
          </Link>
          <div className="flex items-end gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-black border border-white/30">
              {school.name_en.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Name + badges */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge}`}>
                    {typeLabel(school.school_type)}
                  </span>
                  {school.verified && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                      <CheckCircle size={11} /> Verified
                    </span>
                  )}
                </div>
                <QRCodeCard url={`${BASE_URL}/schools/${school.id}`} name={school.name_en} type="school" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">{school.name_en}</h1>
              <p className="text-slate-400 text-base mb-4 font-medium">{school.name_am}</p>
              <p className="text-slate-600 leading-relaxed">{school.description}</p>
            </div>

            {/* School details grid */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4 text-lg">School Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {infoItems.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-primary-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</div>
                      <div className="text-sm font-semibold text-slate-800 mt-0.5">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            {school.tags?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 mb-3 text-lg">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {school.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-600 capitalize">
                      {tag.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4 text-lg flex items-center gap-2">
                <MapPin size={18} className="text-primary-600" /> Location
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                {school.sub_city}{school.woreda ? `, Woreda ${school.woreda}` : ''}, Ethiopia
                {school.coordinates_accuracy === 'low' && (
                  <span className="ml-2 text-amber-600 text-xs">(approximate location)</span>
                )}
              </p>
              <MapComponent schools={[school]} center={[school.latitude, school.longitude]} zoom={15} height="280px" />
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">

            {/* Contact card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-20">
              <h2 className="font-bold text-slate-900 mb-4 text-base">Contact School</h2>
              <div className="space-y-3">
                {school.phone && (
                  <a href={`tel:${school.phone}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center shrink-0">
                      <Phone size={16} className="text-primary-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Phone</div>
                      <div className="text-sm font-semibold text-slate-800">{school.phone}</div>
                    </div>
                  </a>
                )}
                {school.email && (
                  <a href={`mailto:${school.email}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center shrink-0">
                      <Mail size={16} className="text-primary-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Email</div>
                      <div className="text-sm font-semibold text-slate-800 break-all">{school.email}</div>
                    </div>
                  </a>
                )}
                {school.website && (
                  <a href={`https://${school.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-all group">
                    <div className="w-9 h-9 rounded-xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center shrink-0">
                      <Globe size={16} className="text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-400">Website</div>
                      <div className="text-sm font-semibold text-slate-800 truncate flex items-center gap-1">
                        {school.website} <ExternalLink size={11} />
                      </div>
                    </div>
                  </a>
                )}
                {!school.phone && !school.email && !school.website && (
                  <p className="text-sm text-slate-400 text-center py-3">No contact info available</p>
                )}
              </div>

              {/* Fee highlight */}
              <div className="mt-4 p-4 rounded-xl bg-primary-50 border border-primary-100">
                <div className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">Annual Tuition</div>
                <div className="text-xl font-extrabold text-primary-700">{formatFee(school.fee_range_etb)}</div>
                {school.fee_range_usd && school.fee_range_usd !== 'Free' && (
                  <div className="text-xs text-primary-500 mt-0.5">≈ {school.fee_range_usd} USD/year</div>
                )}
              </div>
            </div>

            {/* Data quality notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
              <strong>Note:</strong> Data may not be fully up to date. Always confirm fees and details directly with the school.
            </div>
          </div>
        </div>

        {/* Related schools */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900 mb-5">
              Other Schools in {school.sub_city}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((s) => <SchoolCard key={s.id} school={s} />)}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
