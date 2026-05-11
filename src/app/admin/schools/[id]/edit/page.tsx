import { notFound } from 'next/navigation'
import SchoolForm from '@/components/SchoolForm'
import { getSchoolById, schools } from '@/lib/data'

export function generateStaticParams() {
  return schools.map((s) => ({ id: String(s.id) }))
}

export default function EditSchoolPage({ params }: { params: { id: string } }) {
  const school = getSchoolById(Number(params.id))
  if (!school) notFound()

  return <SchoolForm title={`Edit: ${school.name_en}`} initial={school} />
}
