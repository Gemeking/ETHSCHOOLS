import { redirect } from 'next/navigation'

// next.config.js already redirects '/' -> '/schools' at the routing layer.
// This is a defense-in-depth fallback; force-dynamic avoids a static-generation
// bug where redirect() inside a prerendered page produced a broken error shell.
export const dynamic = 'force-dynamic'

export default function HomePage() {
  redirect('/schools')
}
