import { readFileSync, writeFileSync } from 'fs'

const newSchools = JSON.parse(readFileSync('./new_schools.json', 'utf-8'))
const geocoded = JSON.parse(readFileSync('./geocoded_districts.json', 'utf-8'))
const knownCentroids = JSON.parse(readFileSync('./known_centroids.json', 'utf-8'))
let failures = []
try { failures = JSON.parse(readFileSync('./geocode_failures.json', 'utf-8')) } catch {}

// Coarse region-level fallback — last resort only, for districts Nominatim
// couldn't resolve at all. Intentionally marked low accuracy.
const REGION_FALLBACK = {
  'Addis Ababa': [9.03, 38.74],
  'Afar': [11.75, 41.05],
  'Oromia': [8.00, 39.00],
  'Amhara': [11.5, 37.5],
  'Benishangul Gumz': [10.5, 34.5],
  'Dire Dawa': [9.59, 41.87],
  'Gambela': [8.25, 34.58],
  'Harari': [9.31, 42.12],
  'Sidama': [6.9, 38.4],
  'SNNP': [6.5, 37.5],
  'Somali': [7.5, 44.0],
  'South West Ethiopia': [7.0, 36.0],
  'Tigray': [13.5, 39.5],
}

const districtCoords = new Map() // key -> {lat, lon, accuracy}

for (const [woreda, [lat, lon]] of Object.entries(knownCentroids)) {
  // Known centroids apply whenever the woreda name matches, regardless of
  // region/zone spelling in the source file.
  districtCoords.set('KNOWN::' + woreda, { lat, lon, accuracy: 'medium' })
}
for (const g of geocoded) {
  districtCoords.set(g.key, { lat: g.lat, lon: g.lon, accuracy: 'medium' })
}
for (const f of failures) {
  const fallback = REGION_FALLBACK[f.region]
  if (fallback) {
    districtCoords.set(f.key, { lat: fallback[0], lon: fallback[1], accuracy: 'low' })
  }
}

function levelsToGrades(levels) {
  const map = { KG: 'KG', 'Pre-primary': 'Pre-K', Primary: 'Grades 1-8', Secondary: 'Grades 9-12', ABE: 'Alternative Basic Education' }
  const mapped = [...new Set(levels.map((l) => map[l] || l))]
  return mapped.join(', ')
}

function isPlaceholderName(name) {
  const n = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  return n === '' || n === 'na' || n === 'nA' || /^(unknown|none|null|test|xxx?|tbd|nil)$/.test(n) || n.length < 2
}

const rows = []
let noCoords = 0
let placeholders = 0
for (const s of newSchools) {
  if (isPlaceholderName(s.name_en)) { placeholders++; continue }
  const knownKey = 'KNOWN::' + s.woreda
  const districtKey = `${s.region}||${s.zone}||${s.woreda}`
  const coords = districtCoords.get(knownKey) || districtCoords.get(districtKey)
  if (!coords) { noCoords++; continue }

  rows.push({
    name_en: s.name_en,
    name_am: null,
    school_type: 'public', // MoE census — overwhelmingly public/government schools; no reliable private/public signal in the source data
    curriculum: null,
    grades: levelsToGrades(s.levels),
    language: null,
    sub_city: s.woreda,
    woreda: s.woreda,
    latitude: coords.lat,
    longitude: coords.lon,
    fee_range_etb: null,
    fee_range_usd: null,
    fee_min: 0,
    fee_max: 0,
    phone: null,
    email: null,
    website: null,
    description: null,
    established: null,
    verified: false,
    coordinates_accuracy: coords.accuracy,
    tags: ['hxl-import'],
    images: [],
    image_url: null,
  })
}

console.log('total new schools:', newSchools.length)
console.log('skipped (placeholder name like "Na"):', placeholders)
console.log('rows ready to import (have coords):', rows.length)
console.log('skipped (no coords found at all):', noCoords)

const byAccuracy = { medium: 0, low: 0 }
rows.forEach((r) => byAccuracy[r.coordinates_accuracy]++)
console.log('by accuracy:', byAccuracy)

writeFileSync('./final_import.json', JSON.stringify(rows))
console.log('\nWrote final_import.json')
