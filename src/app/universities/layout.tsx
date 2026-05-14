import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ethiopian Universities & Colleges — All Higher Education in Ethiopia',
  description: 'Explore all 56 public, private, and faith-based universities and colleges in Ethiopia. Browse programs, departments, fees, and contact details for every university.',
  keywords: [
    'Ethiopian universities', 'universities in Ethiopia', 'colleges Ethiopia',
    'Addis Ababa university', 'public universities Ethiopia', 'private universities Ethiopia',
    'higher education Ethiopia', 'university programs Ethiopia', 'Ethiopian colleges',
    'apply university Ethiopia', 'university fees Ethiopia', 'STEM universities Ethiopia',
    'medical universities Ethiopia', 'engineering universities Ethiopia',
  ],
  openGraph: {
    title: 'Ethiopian Universities & Colleges Directory — EthioSchools',
    description: 'All 56 universities and colleges in Ethiopia in one place. Find programs, departments, contact details and more.',
    url: 'https://ethschools.vercel.app/universities',
    type: 'website',
  },
  alternates: { canonical: 'https://ethschools.vercel.app/universities' },
}

export default function UniversitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
