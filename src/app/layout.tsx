import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import { SITE_URL, SITE_NAME } from '@/lib/site'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

const BASE = SITE_URL

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'EthioSchools — Find Schools & Universities in Ethiopia',
    template: '%s | EthioSchools',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
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

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: 'The most complete directory of schools and universities in Ethiopia.',
  inLanguage: ['en', 'am'],
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/schools?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  areaServed: { '@type': 'Country', name: 'Ethiopia' },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+251937595664',
    contactType: 'customer service',
    availableLanguage: ['English', 'Amharic'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
        <DisclaimerBanner />
        {children}
      </body>
    </html>
  )
}
