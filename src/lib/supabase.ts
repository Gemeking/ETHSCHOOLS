import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// A slow/unhealthy Supabase instance previously caused serverless functions
// (sitemap, robots.txt) to hang for 20-60+ seconds per request. On Vercel's
// Fluid Compute billing, a hung function burns real compute time the whole
// time it waits — repeated over many requests, that's exactly what blew
// through the account's compute quota and got the whole account paused.
// Every Supabase call now fails fast instead of hanging indefinitely, so a
// database problem costs a bounded ~8s per request instead of an unbounded
// amount that adds up fast at any real traffic volume.
const QUERY_TIMEOUT_MS = 8_000

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: (url: RequestInfo | URL, options: RequestInit = {}) => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), QUERY_TIMEOUT_MS)
      // Next.js caches fetch responses across builds (.next/cache) — without a
      // short revalidate window, a rebuild can bake data from a previous
      // deploy's cache.
      return fetch(url, { ...options, signal: controller.signal, next: { revalidate: 60 } } as RequestInit)
        .finally(() => clearTimeout(timer))
    },
  },
})
