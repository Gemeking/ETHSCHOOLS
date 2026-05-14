import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find Schools in Ethiopia — Search by Location, Type & Fees',
  description: 'Browse 400+ schools across Ethiopia including international, private, and public schools in Addis Ababa, Oromia, Amhara, and more regions. Filter by curriculum, fees, grades, and location.',
  keywords: [
    'schools in Ethiopia', 'Ethiopian schools', 'Addis Ababa schools',
    'international schools Ethiopia', 'private schools Ethiopia',
    'public schools Ethiopia', 'best schools Addis Ababa',
    'KG schools Ethiopia', 'high schools Ethiopia', 'primary schools Ethiopia',
    'boarding schools Ethiopia', 'Cambridge schools Ethiopia', 'IB schools Ethiopia',
    'school fees Ethiopia', 'Oromia schools', 'Amhara schools', 'find school Ethiopia',
  ],
  openGraph: {
    title: 'Find Schools in Ethiopia — EthioSchools Directory',
    description: 'Search and compare 400+ schools across Ethiopia. Filter by type, location, curriculum, and fees.',
    url: 'https://ethschools.vercel.app/schools',
    type: 'website',
  },
  alternates: { canonical: 'https://ethschools.vercel.app/schools' },
}

export default function SchoolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
