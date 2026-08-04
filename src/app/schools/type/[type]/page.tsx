import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { GraduationCap, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PaginatedSchoolGrid from '@/components/PaginatedSchoolGrid'
import { fetchAllSchools } from '@/lib/supabase-data'
import { SITE_URL, SITE_NAME, citySlug, schoolPath } from '@/lib/site'
import type { School } from '@/lib/types'

export const revalidate = 3600

const TYPE_META: Record<string, { label: string; plural: string; blurb: string }> = {
  international: {
    label: 'International',
    plural: 'International Schools',
    blurb: 'offering IB, Cambridge, American and other international curricula',
  },
  private: {
    label: 'Private',
    plural: 'Private Schools',
    blurb: 'privately run schools with Ethiopian and blended curricula',
  },
  public: {
    label: 'Public',
    plural: 'Public / Government Schools',
    blurb: 'government schools following the Ethiopian national curriculum',
  },
  tvet: {
    label: 'TVET',
    plural: 'TVET & Technical Colleges',
    blurb: 'technical and vocational education and training institutes',
  },
}

export function generateStaticParams() {
  return Object.keys(TYPE_META).map((type) => ({ type }))
}

export async function generateMetadata({ params }: { params: { type: string } }): Promise<Metadata> {
  const meta = TYPE_META[params.type]
  if (!meta) return { title: 'Not Found' }
  const all = await fetchAllSchools()
  const list = all.filter((s) => s.school_type === params.type)
  const url = `${SITE_URL}/schools/type/${params.type}`
  const title = `${meta.plural} in Ethiopia (${list.length}) — Fees, Contacts & Locations`
  const description = `Full list of ${list.length} ${meta.plural.toLowerCase()} in Ethiopia — ${meta.blurb}. Compare tuition fees, locations, grades and contact details on ${SITE_NAME}.`
  return {
    title,
    description,
    keywords: [
      `${meta.label.toLowerCase()} schools Ethiopia`, `${meta.plural.toLowerCase()} Addis Ababa`,
      `best ${meta.plural.toLowerCase()} Ethiopia`, `${meta.label.toLowerCase()} school fees Ethiopia`,
      'schools in Ethiopia',
    ],
    openGraph: { title, description, url, type: 'website' },
    alternates: { canonical: url },
  }
}

// Hard cap on how many schools this landing page ever embeds — passing an
// unbounded list into the client-side grid serializes every one of those
// records into the page's HTML for hydration. At nationwide scale ("public"
// alone is 50,000+ schools) that blew a single page past 54MB and made every
// Vercel deployment fail outright (19MB hard limit). Anyone wanting more than
// this sample is sent to the full interactive search instead.
const MAX_SAMPLE = 60

export default async function SchoolsByTypePage({ params }: { params: { type: string } }) {
  const meta = TYPE_META[params.type]
  if (!meta) notFound()

  const all = await fetchAllSchools()
  const list = all.filter((s) => s.school_type === params.type)
  if (list.length === 0) notFound()
  const sample = list.slice(0, MAX_SAMPLE)

  const cities = Array.from(
    new Map(list.filter((s) => s.sub_city).map((s) => [citySlug(s.sub_city), s.sub_city])).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]))

  const pageUrl = `${SITE_URL}/schools/type/${params.type}`

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${meta.plural} in Ethiopia`,
    numberOfItems: sample.length,
    itemListElement: sample.map((s, i) => ({
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
      { '@type': 'ListItem', position: 3, name: meta.plural, item: pageUrl },
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
            <GraduationCap className="shrink-0" /> {meta.plural} in Ethiopia
          </h1>
          <p className="text-white/80 max-w-3xl leading-relaxed">
            {SITE_NAME} lists <strong>{list.length} {meta.plural.toLowerCase()}</strong> across Ethiopia — {meta.blurb}.
            Open any school profile for tuition fees, curriculum, photos, exact map location and contact details.
          </p>
          <Link
            href={`/schools?type=${params.type}`}
            className="inline-flex items-center gap-2 mt-5 bg-white text-primary-700 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Search &amp; filter all {list.length} {meta.plural.toLowerCase()} →
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {list.length > MAX_SAMPLE && (
          <p className="text-sm text-slate-500 mb-5">
            Showing {MAX_SAMPLE} of {list.length}. <Link href={`/schools?type=${params.type}`} className="text-primary-600 font-semibold hover:underline">Use the full search →</Link>
          </p>
        )}
        <PaginatedSchoolGrid schools={sample} />

        {cities.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Browse schools by city</h2>
            <div className="flex flex-wrap gap-2">
              {cities.map(([slug, cityName]) => (
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
