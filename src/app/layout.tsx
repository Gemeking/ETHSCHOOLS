import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EthioSchool Finder — Find the Best Schools in Addis Ababa',
  description: 'Search and compare international, private, and public schools in Addis Ababa, Ethiopia. Filter by location, fees, curriculum, and more.',
  keywords: 'schools Ethiopia, Addis Ababa schools, international schools Ethiopia, private schools Ethiopia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
