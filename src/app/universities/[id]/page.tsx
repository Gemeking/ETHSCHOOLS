import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
import {
  MapPin, Phone, Mail, Globe, Users, Calendar,
  CheckCircle, ArrowLeft, ExternalLink, GraduationCap, BookOpen, ChevronDown
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import UniversityCard from '@/components/UniversityCard'
import QRCodeCard from '@/components/QRCodeCard'
import PhotoGallery from '@/components/PhotoGallery'
import { universities } from '@/lib/university-data'
import { fetchUniversityById, fetchAllUniversities } from '@/lib/supabase-universities'
import { SITE_URL, universitySlug, universityPath, idFromSlug, DEFAULT_UNIVERSITY_IMAGE } from '@/lib/site'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const uni = await fetchUniversityById(idFromSlug(params.id))
  if (!uni) return { title: 'University Not Found' }
  const url = `${SITE_URL}${universityPath(uni)}`
  const totalPrograms = uni.departments.reduce((s, d) => s + d.programs.length, 0)
  const title = `${uni.name_en} — ${uni.city}, Ethiopia | Programs & Contacts`
  const description = (uni.description
    || `${uni.name_en}${uni.name_am ? ` (${uni.name_am})` : ''} is a ${uni.university_type.replace('_', '-')} university in ${uni.city}, ${uni.region}, Ethiopia. Offering ${uni.departments.length} colleges and ${totalPrograms} programs.`).slice(0, 300)
  return {
    title,
    description,
    keywords: [
      uni.name_en, uni.name_am || '', uni.city, uni.region,
      `${uni.name_en} programs`, `${uni.name_en} departments`, `universities in ${uni.city}`,
      'university Ethiopia', 'Ethiopian university', uni.university_type,
    ].filter(Boolean),
    openGraph: {
      title, description, url, type: 'website',
      ...(uni.images?.[0] ? { images: [{ url: uni.images[0], alt: uni.name_en }] } : {}),
    },
    alternates: { canonical: url },
  }
}

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-200 animate-pulse rounded-2xl" />,
})

const TYPE_GRADIENT: Record<string, string> = {
  public: 'from-emerald-600 to-teal-700',
  private: 'from-blue-600 to-indigo-700',
  faith_based: 'from-amber-600 to-orange-700',
}

const TYPE_BADGE: Record<string, string> = {
  public: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  private: 'bg-blue-100 text-blue-700 border-blue-200',
  faith_based: 'bg-amber-100 text-amber-700 border-amber-200',
}

const TYPE_LABEL: Record<string, string> = {
  public: 'Public University',
  private: 'Private University',
  faith_based: 'Faith-Based University',
}

export async function generateStaticParams() {
  try {
    const all = await fetchAllUniversities()
    return all.map((u) => ({ id: universitySlug(u) }))
  } catch {
    return universities.map((u) => ({ id: universitySlug(u) }))
  }
}

export default async function UniversityDetailPage({ params }: { params: { id: string } }) {
  const university = await fetchUniversityById(idFromSlug(params.id))
  if (!university) notFound()

  // Enforce one canonical URL: /universities/name-city-id (old /universities/12 links 301 here)
  const canonicalSlug = universitySlug(university)
  if (decodeURIComponent(params.id) !== canonicalSlug) {
    permanentRedirect(`/universities/${canonicalSlug}`)
  }

  const gradient = TYPE_GRADIENT[university.university_type] ?? 'from-slate-600 to-slate-800'
  const badge = TYPE_BADGE[university.university_type] ?? 'bg-slate-100 text-slate-700 border-slate-200'

  const allUniversities = await fetchAllUniversities()
  const related = allUniversities
    .filter((u) => u.id !== university.id && u.region === university.region)
    .slice(0, 3)

  const totalPrograms = university.departments.reduce((sum, d) => sum + d.programs.length, 0)

  // Build school-type-compatible object for the map (university as a map point)
  const mapPoint = {
    id: university.id,
    name_en: university.name_en,
    name_am: university.name_am,
    school_type: 'public' as const,
    latitude: university.latitude,
    longitude: university.longitude,
    sub_city: university.city,
    fee_range_etb: university.fee_range_etb ?? '',
    curriculum: university.departments[0]?.name ?? '',
    images: university.images,
    image_url: university.image_url,
    tags: university.tags,
    verified: university.verified,
    fee_min: 0,
    fee_max: 0,
    fee_range_usd: '',
    grades: '',
    language: '',
    woreda: '',
    established: university.established ?? 0,
    coordinates_accuracy: 'medium' as const,
    source: '',
    phone: university.phone,
    email: university.email,
    website: university.website,
    description: university.description,
  }

  const pageUrl = `${SITE_URL}${universityPath(university)}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: university.name_en,
    alternateName: university.name_am,
    description: university.description,
    url: pageUrl,
    image: university.images?.[0] || undefined,
    telephone: university.phone,
    email: university.email,
    sameAs: university.website ? `https://${university.website}` : undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: university.city,
      addressRegion: university.region,
      addressCountry: 'ET',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: university.latitude,
      longitude: university.longitude,
    },
    foundingDate: university.established,
    numberOfStudents: university.student_count,
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Universities', item: `${SITE_URL}/universities` },
      { '@type': 'ListItem', position: 3, name: university.name_en, item: pageUrl },
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
        <img src={university.images?.[0] || DEFAULT_UNIVERSITY_IMAGE} alt={university.name_en} className="absolute inset-0 w-full h-full object-cover" />
        <div className={`absolute inset-0 ${university.images?.[0] ? 'bg-black/20' : `bg-gradient-to-br ${gradient} opacity-70`}`} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-between py-6">
          <Link href="/universities" className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors w-fit">
            <ArrowLeft size={16} /> Back to Universities
          </Link>
          <div className="flex items-end gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-black border border-white/30">
              {university.name_en.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Name + badges */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge}`}>
                    {TYPE_LABEL[university.university_type]}
                  </span>
                  {university.verified && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                      <CheckCircle size={11} /> Verified
                    </span>
                  )}
                </div>
                <QRCodeCard url={pageUrl} name={university.name_en} type="university" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">{university.name_en}</h1>
              <p className="text-slate-400 text-base mb-4 font-medium">{university.name_am}</p>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-primary-600">{university.departments.length}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Colleges</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-primary-600">{totalPrograms}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Programs</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-primary-600">{university.established ?? 'N/A'}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Est.</div>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed">{university.description}</p>
            </div>

            {/* Departments & Programs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-5 text-lg flex items-center gap-2">
                <BookOpen size={18} className="text-primary-600" /> Colleges & Programs
              </h2>
              <div className="space-y-4">
                {university.departments.map((dept, idx) => (
                  <details key={idx} className="group border border-slate-200 rounded-xl overflow-hidden" open={idx === 0}>
                    <summary className="flex items-center justify-between px-4 py-3 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors list-none">
                      <div>
                        <span className="font-semibold text-slate-800 text-sm">{dept.name}</span>
                        <span className="ml-2 text-xs text-slate-400">{dept.programs.length} programs</span>
                      </div>
                      <ChevronDown size={16} className="text-slate-400 group-open:rotate-180 transition-transform shrink-0" />
                    </summary>
                    <div className="px-4 py-3 flex flex-wrap gap-2">
                      {dept.programs.map((program) => (
                        <span
                          key={program}
                          className="px-2.5 py-1 rounded-full text-xs bg-primary-50 text-primary-700 border border-primary-100 font-medium"
                        >
                          {program}
                        </span>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Tags */}
            {university.tags?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 mb-3 text-lg">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {university.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-600 capitalize">
                      {tag.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Photo gallery */}
            {university.images && university.images.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 mb-4 text-lg flex items-center gap-2">
                  🖼️ Photos
                </h2>
                <PhotoGallery images={university.images} name={university.name_en} />
              </div>
            )}

            {/* Map */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4 text-lg flex items-center gap-2">
                <MapPin size={18} className="text-primary-600" /> Location
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                {university.city}, {university.region}, Ethiopia
              </p>
              <MapComponent schools={[mapPoint]} center={[university.latitude, university.longitude]} zoom={14} height="280px" />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Info card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-28">
              <h2 className="font-bold text-slate-900 mb-4 text-base">University Info</h2>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <MapPin size={14} className="text-primary-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Location</div>
                    <div className="text-sm font-semibold text-slate-800">{university.city}, {university.region}</div>
                  </div>
                </div>

                {university.established && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                      <Calendar size={14} className="text-primary-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Established</div>
                      <div className="text-sm font-semibold text-slate-800">{university.established}</div>
                    </div>
                  </div>
                )}

                {university.student_count && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                      <Users size={14} className="text-primary-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Students</div>
                      <div className="text-sm font-semibold text-slate-800">{university.student_count}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact */}
              <h3 className="font-semibold text-slate-700 text-sm mb-3">Contact</h3>
              <div className="space-y-2">
                {university.phone && (
                  <a href={`tel:${university.phone}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-all group">
                    <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                      <Phone size={14} className="text-primary-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Phone</div>
                      <div className="text-sm font-semibold text-slate-800">{university.phone}</div>
                    </div>
                  </a>
                )}
                {university.email && (
                  <a href={`mailto:${university.email}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-all group">
                    <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                      <Mail size={14} className="text-primary-600" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Email</div>
                      <div className="text-sm font-semibold text-slate-800 break-all">{university.email}</div>
                    </div>
                  </a>
                )}
                {university.website ? (
                  <>
                    <a href={`https://${university.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-all group">
                      <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                        <Globe size={14} className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-400">Website</div>
                        <div className="text-sm font-semibold text-slate-800 truncate flex items-center gap-1">
                          {university.website} <ExternalLink size={11} />
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
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 text-lg">🌐</div>
                    <div>
                      <div className="text-xs font-bold text-indigo-800">No website yet?</div>
                      <div className="text-xs text-indigo-600 leading-relaxed">We can build one for this university. Contact <strong>@abrolabs</strong> on Telegram</div>
                    </div>
                  </a>
                )}
              </div>

              {/* Tuition */}
              {university.fee_range_etb && (
                <div className="mt-4 p-4 rounded-xl bg-primary-50 border border-primary-100">
                  <div className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">Annual Tuition</div>
                  <div className="text-base font-extrabold text-primary-700">{university.fee_range_etb}</div>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
              <strong>Note:</strong> Program lists and fee information may change. Always confirm with the university directly.{' '}
              <Link href={`/report?school=${encodeURIComponent(university.name_en)}`} className="font-bold underline hover:text-amber-900">
                See something wrong? Report it →
              </Link>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
              <GraduationCap size={20} className="text-primary-600" />
              Other Universities in {university.region}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((u) => <UniversityCard key={u.id} university={u} />)}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
