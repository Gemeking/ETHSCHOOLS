'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import UniversityForm from '@/components/UniversityForm'
import { fetchUniversityById } from '@/lib/supabase-universities'
import type { University } from '@/lib/types'

export default function EditUniversityPage() {
  const { id } = useParams()
  const [university, setUniversity] = useState<University | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUniversityById(Number(id)).then((u) => {
      setUniversity(u)
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

  if (!university) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="font-medium">University not found</p>
      </div>
    )
  }

  return <UniversityForm initial={university} />
}
