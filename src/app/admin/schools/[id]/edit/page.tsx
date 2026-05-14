'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import SchoolForm from '@/components/SchoolForm'
import { fetchSchoolById } from '@/lib/supabase-data'
import type { School } from '@/lib/types'

export default function EditSchoolPage() {
  const { id } = useParams()
  const [school, setSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchoolById(Number(id)).then((s) => {
      setSchool(s)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!school) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="font-medium">School not found</p>
      </div>
    )
  }

  return <SchoolForm title={`Edit: ${school.name_en}`} initial={school} />
}
