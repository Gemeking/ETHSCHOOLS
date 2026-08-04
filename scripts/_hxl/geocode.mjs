import { readFileSync, writeFileSync, existsSync } from 'fs'

const districts = JSON.parse(readFileSync('./districts_to_geocode.json', 'utf-8'))

const OUT_FILE = './geocoded_districts.json'
const FAILED_FILE = './geocode_failures.json'

let results = existsSync(OUT_FILE) ? JSON.parse(readFileSync(OUT_FILE, 'utf-8')) : []
let failures = existsSync(FAILED_FILE) ? JSON.parse(readFileSync(FAILED_FILE, 'utf-8')) : []
const doneKeys = new Set(results.map((r) => r.key))
const failedKeys = new Set(failures.map((f) => f.key))

function keyOf(d) {
  return `${d.region}||${d.zone}||${d.woreda}`
}

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
    q: query, format: 'json', limit: '1', countrycodes: 'et',
  })
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ethioschool.et district geocoding (one-time batch, contact via site)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data[0] ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null
}

let processed = 0
for (const d of districts) {
  const key = keyOf(d)
  if (doneKeys.has(key) || failedKeys.has(key)) continue

  // Try progressively broader queries: woreda+zone+region, then zone+region, then region alone.
  const attempts = [
    `${d.woreda}, ${d.zone}, ${d.region}, Ethiopia`,
    `${d.woreda}, ${d.region}, Ethiopia`,
    `${d.zone}, ${d.region}, Ethiopia`,
  ]

  let found = null
  for (const q of attempts) {
    try {
      found = await geocode(q)
      await new Promise((r) => setTimeout(r, 1100)) // respect Nominatim's 1 req/sec policy
      if (found) break
    } catch (e) {
      console.log(`  error geocoding "${q}":`, e.message)
      await new Promise((r) => setTimeout(r, 1100))
    }
  }

  processed++
  if (found) {
    results.push({ key, region: d.region, zone: d.zone, woreda: d.woreda, count: d.count, lat: found.lat, lon: found.lon })
    doneKeys.add(key)
    console.log(`[${processed}/${districts.length}] OK  ${d.woreda}, ${d.zone}, ${d.region} -> ${found.lat},${found.lon} (${d.count} schools)`)
  } else {
    failures.push({ key, region: d.region, zone: d.zone, woreda: d.woreda, count: d.count })
    failedKeys.add(key)
    console.log(`[${processed}/${districts.length}] FAIL ${d.woreda}, ${d.zone}, ${d.region} (${d.count} schools)`)
  }

  // Save progress every 10 districts in case of interruption.
  if (processed % 10 === 0) {
    writeFileSync(OUT_FILE, JSON.stringify(results, null, 1))
    writeFileSync(FAILED_FILE, JSON.stringify(failures, null, 1))
  }
}

writeFileSync(OUT_FILE, JSON.stringify(results, null, 1))
writeFileSync(FAILED_FILE, JSON.stringify(failures, null, 1))
console.log(`\nDone. Geocoded: ${results.length}, Failed: ${failures.length}`)
