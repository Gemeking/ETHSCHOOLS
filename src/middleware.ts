import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Best-effort rate limiting for the routes that do heavy Supabase work
// (paging through the full schools table). This uses an in-memory Map, so it
// resets whenever a serverless instance recycles and isn't shared across
// instances — it will not stop a large, distributed crawl. What it does stop
// is exactly what caused tonight's incident: rapid repeated hits (manual
// testing, a retrying crawler, a stuck loop) landing on the same warm
// instance in a short window, each one paying the full cost of a database
// round-trip. Paired with the query timeout and maxDuration caps, this is
// one more independent layer, not the only one.
const WINDOW_MS = 10_000
const MAX_REQUESTS_PER_WINDOW = 3

const hits = new Map<string, number[]>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  timestamps.push(now)
  hits.set(key, timestamps)

  // Keep the map from growing unbounded on a long-lived warm instance.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t > WINDOW_MS)) hits.delete(k)
    }
  }

  return timestamps.length > MAX_REQUESTS_PER_WINDOW
}

const RATE_LIMITED_PREFIXES = ['/sitemap', '/robots.txt']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!RATE_LIMITED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const key = `${ip}:${pathname}`

  if (isRateLimited(key)) {
    return new NextResponse('Too many requests, please slow down.', {
      status: 429,
      headers: { 'Retry-After': '10' },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/sitemap/:path*', '/robots.txt'],
}
