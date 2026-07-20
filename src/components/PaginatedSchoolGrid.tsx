'use client'
import { useRef, useState } from 'react'
import SchoolCard from '@/components/SchoolCard'
import Pagination from '@/components/Pagination'
import type { School } from '@/lib/types'

const PAGE_SIZE = 15

export default function PaginatedSchoolGrid({ schools }: { schools: School[] }) {
  const [page, setPage] = useState(1)
  const topRef = useRef<HTMLDivElement>(null)

  const totalPages = Math.ceil(schools.length / PAGE_SIZE)
  const visible = schools.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const onPage = (p: number) => {
    setPage(p)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div ref={topRef} className="scroll-mt-28">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((s, i) => (
          <SchoolCard key={s.id} school={s} index={i} />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} total={schools.length} pageSize={PAGE_SIZE} onPage={onPage} />
    </div>
  )
}
