import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { MapPin, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PaginatedSchoolGrid from '@/components/PaginatedSchoolGrid'
import { fetchAllSchools } from '@/lib/supabase-data'
import { schools as localSchools } from '@/lib/data'
import { typeLabel } from '@/lib/utils'
import { SITE_URL, SITE_NAME, citySlug, schoolPath } from '@/lib/site'
import type { School } from '@/lib/types'

export const revalidate = 3600

async function getCitySchools(city: string): Promise<{ name: string; schools: School[] }> {
  const all = await fetchAllSchools()
  const matches = all.filter((s) => s.sub_city && citySlug(s.sub_city) === city)
  return { name: matches[0]?.sub_city ?? '', schools: matches }
}

// Pre-build only the busiest cities (most schools = most likely to be
// visited) up to a bounded cap; the rest still render correctly on first
// visit via ISR — same reasoning as schools/[id]. Prevents this list from
// growing past what a single build can handle once every district has its
// own page (potentially 900+ after a nationwide import).
const MAX_STATIC_CITY_PAGES = 300

export async function generateStaticParams() {
  let all: School[]
  try {
    all = await fetchAllSchools()
  } catch {
    all = localSchools
  }
  const counts = new Map<string, number>()
  for (const s of all) {
    if (s.sub_city) {
      const slug = citySlug(s.sub_city)
      if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_STATIC_CITY_PAGES)
    .map(([city]) => ({ city }))
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const { name, schools } = await getCitySchools(params.city)
  if (!name || schools.length === 0) return { title: 'Schools Not Found' }
  const url = `${SITE_URL}/schools/in/${params.city}`
  const types = Array.from(new Set(schools.map((s) => typeLabel(s.school_type)))).join(', ')
  const title = `${schools.length} Schools in ${name}, Ethiopia — Fees, Contacts & Locations`
  const description = `Complete list of ${schools.length} schools in ${name}, Ethiopia (${types}). Compare tuition fees, curriculum, grades, phone numbers and exact locations. Updated directory — free to use.`
  return {
    title,
    description,
    keywords: [
      `schools in ${name}`, `${name} schools`, `best schools in ${name}`,
      `private schools ${name}`, `school fees ${name}`, `kindergarten ${name}`,
      'schools in Ethiopia', 'Ethiopian schools',
    ],
    openGraph: { title, description, url, type: 'website' },
    alternates: { canonical: url },
  }
}

export default async function SchoolsInCityPage({ params }: { params: { city: string } }) {
  const { name, schools } = await getCitySchools(params.city)
  if (!name || schools.length === 0) notFound()

  const all = await fetchAllSchools()
  const otherCities = Array.from(
    new Map(
      all
        .filter((s) => s.sub_city && citySlug(s.sub_city) !== params.city)
        .map((s) => [citySlug(s.sub_city), s.sub_city])
    ).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]))

  const typeCounts = schools.reduce<Record<string, number>>((acc, s) => {
    acc[s.school_type] = (acc[s.school_type] ?? 0) + 1
    return acc
  }, {})
  const typeSummary = Object.entries(typeCounts)
    .map(([t, n]) => `${n} ${typeLabel(t as School['school_type']).toLowerCase()}`)
    .join(', ')

  const pageUrl = `${SITE_URL}/schools/in/${params.city}`

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Schools in ${name}, Ethiopia`,
    numberOfItems: schools.length,
    itemListElement: schools.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.name_en,
      url: `${SITE_URL}${schoolPath(s)}`,
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Schools', item: `${SITE_URL}/schools` },
      { '@type': 'ListItem', position: 3, name: `Schools in ${name}`, item: pageUrl },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <Navbar />

      <div className="bg-gradient-to-br from-primary-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/schools" className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors w-fit mb-4">
            <ArrowLeft size={16} /> All Schools
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 flex items-center gap-3">
            <MapPin className="shrink-0" /> Schools in {name}, Ethiopia
          </h1>
          <p className="text-white/80 max-w-3xl leading-relaxed">
            There {schools.length === 1 ? 'is' : 'are'} <strong>{schools.length} school{schools.length === 1 ? '' : 's'}</strong> listed
            in {name} on {SITE_NAME}: {typeSummary}. Compare tuition fees, curriculum, grade levels and contact
            details below, or open any school profile for photos, an exact map location and phone numbers.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <PaginatedSchoolGrid schools={schools} />

        {otherCities.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Find schools in other cities</h2>
            <div className="flex flex-wrap gap-2">
              {otherCities.map(([slug, cityName]) => (
                <Link
                  key={slug}
                  href={`/schools/in/${slug}`}
                  className="px-3 py-1.5 rounded-full text-sm bg-white border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700 transition-colors"
                >
                  Schools in {cityName}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
