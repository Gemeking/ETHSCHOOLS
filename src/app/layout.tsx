import type { Metadata } from 'next'
import './globals.css'
import PageLoader from '@/components/PageLoader'
import DisclaimerBanner from '@/components/DisclaimerBanner'

const BASE = 'https://ethschools.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'EthioSchools — Find Schools & Universities in Ethiopia',
    template: '%s | EthioSchools',
  },
  description: 'The most complete directory of schools and universities in Ethiopia. Search 400+ schools and 56 universities by location, fees, curriculum, and programs. Free to use.',
  keywords: [
    'schools Ethiopia', 'Ethiopian schools', 'universities Ethiopia',
    'schools in Ethiopia', 'Addis Ababa schools', 'find school Ethiopia',
    'Ethiopian education', 'school directory Ethiopia', 'private schools Ethiopia',
    'international schools Ethiopia', 'public schools Ethiopia',
    'best schools in Ethiopia', 'Ethiopian universities list',
    'higher education Ethiopia', 'school fees Ethiopia', 'university programs Ethiopia',
    'KG schools Addis Ababa', 'boarding schools Ethiopia', 'IB schools Ethiopia',
  ],
  authors: [{ name: 'EthioSchools', url: BASE }],
  creator: 'EthioSchools',
  publisher: 'EthioSchools',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    locale: 'en_ET',
    url: BASE,
    siteName: 'EthioSchools',
    title: 'EthioSchools — Find Schools & Universities in Ethiopia',
    description: 'Search and compare 400+ schools and 56 universities across Ethiopia. Filter by type, location, curriculum, and fees. Free to use.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EthioSchools — Find Schools & Universities in Ethiopia',
    description: 'Search and compare 400+ schools and 56 universities across Ethiopia.',
  },
  alternates: { canonical: BASE },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageLoader />
        {children}
        <DisclaimerBanner />
      </body>
    </html>
  )
}
