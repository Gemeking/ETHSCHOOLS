import type { Metadata } from 'next'
import './globals.css'
import PageLoader from '@/components/PageLoader'

export const metadata: Metadata = {
  title: 'EthioSchool Finder — Schools & Universities in Ethiopia',
  description: 'Search and compare international, private, and public schools and universities across Ethiopia. Filter by location, fees, curriculum, and programs.',
  keywords: 'schools Ethiopia, universities Ethiopia, Addis Ababa schools, Sheger City schools, international schools Ethiopia, Ethiopian universities',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageLoader />
        {children}
      </body>
    </html>
  )
}
