import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Next.js caches fetch responses across builds (.next/cache) — without a short
// revalidate window, a rebuild can bake data from a previous deploy's cache.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: (url: RequestInfo | URL, options: RequestInit = {}) =>
      fetch(url, { ...options, next: { revalidate: 60 } } as RequestInit),
  },
})
