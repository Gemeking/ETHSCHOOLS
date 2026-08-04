import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import {
  MapPin, Phone, Mail, Globe, BookOpen, Users, Calendar,
  CheckCircle, ArrowLeft, ExternalLink, DollarSign, Languages
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SchoolCard from '@/components/SchoolCard'
import QRCodeCard from '@/components/QRCodeCard'
import PhotoGallery from '@/components/PhotoGallery'
import { schools } from '@/lib/data'
import { fetchSchoolById, fetchAllSchools } from '@/lib/supabase-data'
import { typeColor, typeGradient, typeLabel, formatFee } from '@/lib/utils'
import { SITE_URL, schoolSlug, schoolPath, idFromSlug, citySlug, DEFAULT_SCHOOL_IMAGE } from '@/lib/site'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const school = await fetchSchoolById(idFromSlug(params.id))
  if (!school) return { title: 'School Not Found' }
  const url = `${SITE_URL}${schoolPath(school)}`
  const title = `${school.name_en} — ${school.sub_city}, Ethiopia | Fees, Contacts & Location`
  const description = (school.description
    || `${school.name_en}${school.name_am ? ` (${school.name_am})` : ''} is a ${typeLabel(school.school_type).toLowerCase()} school in ${school.sub_city}, Ethiopia. Curriculum: ${school.curriculum}. Grades: ${school.grades}. Fees: ${formatFee(school.fee_range_etb)}.`).slice(0, 300)
  return {
    title,
    description,
    keywords: [
      school.name_en, school.name_am || '', school.sub_city || '',
      `schools in ${school.sub_city}`, `${school.name_en} fees`, `${school.name_en} contact`,
      'school Ethiopia', school.curriculum || '', school.school_type, 'Ethiopian school',
    ].filter(Boolean),
    openGraph: {
      title, description, url, type: 'website',
      ...(school.images?.[0] ? { images: [{ url: school.images[0], alt: school.name_en }] } : {}),
    },
    alternates: { canonical: url },
  }
}

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-200 animate-pulse rounded-2xl" />,
})

// Pre-build a bounded, priority-ordered slice at deploy time (verified schools
// first) instead of the whole catalog — with 69,000+ schools, mapping every
// row here would blow Vercel's per-page static generation timeout on every
// future deploy, not just once. Everything outside this cap still renders
// correctly (full server-rendered HTML, same metadata/JSON-LD) on first
// visit via ISR (revalidate above) and is still fully crawlable — it's just
// built on-demand instead of ahead of time. dynamicParams defaults to true,
// so unlisted ids are not 404s.
const MAX_STATIC_SCHOOL_PAGES = 1000

export async function generateStaticParams() {
  try {
    const all = await fetchAllSchools()
    const prioritized = [...all].sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0))
    return prioritized.slice(0, MAX_STATIC_SCHOOL_PAGES).map((s) => ({ id: schoolSlug(s) }))
  } catch {
    return schools.map((s) => ({ id: schoolSlug(s) }))
  }
}

export default async function SchoolDetailPage({ params }: { params: { id: string } }) {
  const school = await fetchSchoolById(idFromSlug(params.id))
  if (!school) notFound()

  // Enforce one canonical URL: /schools/name-subcity-id (old /schools/123 links 301 here)
  const canonicalSlug = schoolSlug(school)
  if (decodeURIComponent(params.id) !== canonicalSlug) {
    permanentRedirect(`/schools/${canonicalSlug}`)
  }

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

  const pageUrl = `${SITE_URL}${schoolPath(school)}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'School',
    name: school.name_en,
    alternateName: school.name_am,
    description: school.description,
    url: pageUrl,
    image: school.images?.[0] || undefined,
    telephone: school.phone,
    email: school.email,
    sameAs: school.website ? `https://${school.website}` : undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: school.sub_city,
      addressCountry: 'ET',
      addressRegion: 'Addis Ababa',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: school.latitude,
      longitude: school.longitude,
    },
    foundingDate: school.established,
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Schools', item: `${SITE_URL}/schools` },
      ...(school.sub_city
        ? [{ '@type': 'ListItem', position: 3, name: `Schools in ${school.sub_city}`, item: `${SITE_URL}/schools/in/${citySlug(school.sub_city)}` }]
        : []),
      { '@type': 'ListItem', position: school.sub_city ? 4 : 3, name: school.name_en, item: pageUrl },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Navbar />

      {/* Hero banner */}
      <div className={`relative bg-gradient-to-br ${gradient} h-48 sm:h-64 overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/10" />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={school.images?.[0] || DEFAULT_SCHOOL_IMAGE} alt={school.name_en} className="absolute inset-0 w-full h-full object-cover" />
        <div className={`absolute inset-0 ${school.images?.[0] ? 'bg-black/20' : `bg-gradient-to-br ${gradient} opacity-70`}`} />
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
                <QRCodeCard url={pageUrl} name={school.name_en} type="school" />
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

            {/* Tags — internal data-source markers (hxl-import, osm-import) are
                filtered out here; they're for our own tracking, not visitors. */}
            {school.tags?.filter((t) => !t.endsWith('-import')).length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 mb-3 text-lg">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {school.tags.filter((t) => !t.endsWith('-import')).map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-600 capitalize">
                      {tag.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Photo gallery */}
            {school.images && school.images.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 mb-4 text-lg flex items-center gap-2">
                  🖼️ Photos
                </h2>
                <PhotoGallery images={school.images} name={school.name_en} />
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
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-28">
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
                {school.website ? (
                  <>
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
                    <a href="https://t.me/abrolabs" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors">
                      <span className="text-base">💻</span>
                      <div>
                        <div className="text-xs font-bold text-indigo-700">Want a better website?</div>
                        <div className="text-xs text-indigo-500">We build websites — contact @abrolabs</div>
                      </div>
                    </a>
                  </>
                ) : (
                  <a href="https://t.me/abrolabs" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 hover:border-indigo-400 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 text-lg">🌐</div>
                    <div>
                      <div className="text-xs font-bold text-indigo-800">No website yet?</div>
                      <div className="text-xs text-indigo-600 leading-relaxed">We can build a professional website for this school. Reach us on Telegram <strong>@abrolabs</strong></div>
                    </div>
                  </a>
                )}
                {!school.phone && !school.email && !school.website && (
                  <p className="text-sm text-slate-400 text-center py-1">No other contact info available</p>
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
              <strong>Note:</strong> Data may not be fully up to date. Always confirm fees and details directly with the school.{' '}
              <Link href={`/report?school=${encodeURIComponent(school.name_en)}`} className="font-bold underline hover:text-amber-900">
                See something wrong? Report it →
              </Link>
            </div>
          </div>
        </div>

        {/* Related schools */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900 mb-5">
              <Link href={`/schools/in/${citySlug(school.sub_city)}`} className="hover:text-primary-600 transition-colors">
                Other Schools in {school.sub_city}
              </Link>
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
