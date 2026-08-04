import { readFileSync, writeFileSync } from 'fs'

const raw = JSON.parse(readFileSync('C:/Users/user/Downloads/list-of-schools-in-ethiopia_hxl.json', 'utf-8'))
const rows = raw['School'].filter((r) => r['School Name'] && !String(r['School Name']).startsWith('#'))
const existing = JSON.parse(readFileSync('./existing_schools.json', 'utf-8'))

// Known coordinates we already have (Addis Ababa sub-cities + Sheger towns) —
// these HXL "Woreda" values match our existing sub-city names exactly, so no
// geocoding needed for them.
const KNOWN_CENTROIDS = {
  'Bole': [8.9930, 38.7920], 'Yeka': [9.0300, 38.8100], 'Kirkos': [9.0100, 38.7550],
  'Arada': [9.0350, 38.7450], 'Addis Ketema': [9.0350, 38.7300], 'Lideta': [9.0100, 38.7380],
  'Kolfe Keranio': [9.0250, 38.6950], 'Nifas Silk-Lafto': [8.9700, 38.7400],
  'Akaki Kaliti': [8.8800, 38.7900], 'Gulele': [9.0600, 38.7350],
  'Kolfe': [9.0250, 38.6950], 'Lemi Kura': [9.0300, 38.7750], // newer Addis sub-city names
}

function normName(s) {
  return String(s)
    .toLowerCase()
    .replace(/\b(school|primary|secondary|preparatory|academy|the|of|kindergarten|kg|elementary|public|private|no\.?\s*\d+)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

function titleCase(s) {
  const str = String(s).trim()
  if (str === str.toUpperCase() && str !== str.toLowerCase()) {
    // ALL-CAPS name from the source file — normalize casing
    return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
  }
  return str
}

// --- within-dataset cleanup: collapse KG/Primary/Secondary/ABE level entries
// for the same physical school (same name + woreda) into one record, keeping
// the broadest grade info.
const byKey = new Map()
for (const r of rows) {
  const name = titleCase(r['School Name'])
  const key = `${r.Woreda}||${normName(name)}`
  const level = r['School Level']
  if (byKey.has(key)) {
    const existing = byKey.get(key)
    if (!existing.levels.includes(level)) existing.levels.push(level)
  } else {
    byKey.set(key, {
      name_en: name,
      region: r.Region,
      zone: r.Zone,
      woreda: r.Woreda,
      woredaPcode: r['Woreda Pcode'],
      levels: [level],
    })
  }
}
const cleaned = Array.from(byKey.values())
console.log('rows after collapsing multi-level duplicates:', cleaned.length)

// --- dedupe against existing DB schools (name-only match, per user request
// to never re-add schools already present) ---
const existingNames = new Set(existing.map((e) => normName(e.name_en)))
const newOnes = cleaned.filter((c) => !existingNames.has(normName(c.name_en)))
console.log('already in DB (skipped):', cleaned.length - newOnes.length)
console.log('genuinely new:', newOnes.length)

// --- districts needing geocoding ---
const districtKey = (r) => `${r.region}||${r.zone}||${r.woreda}`
const districts = new Map()
for (const r of newOnes) {
  const key = districtKey(r)
  if (!districts.has(key)) districts.set(key, { region: r.region, zone: r.zone, woreda: r.woreda, count: 0 })
  districts.get(key).count++
}
console.log('unique districts among new schools:', districts.size)

const needsGeocode = []
const alreadyKnown = []
for (const d of districts.values()) {
  if (KNOWN_CENTROIDS[d.woreda]) alreadyKnown.push(d)
  else needsGeocode.push(d)
}
console.log('districts already known (Addis sub-cities):', alreadyKnown.length)
console.log('districts needing geocoding:', needsGeocode.length)

writeFileSync('./new_schools.json', JSON.stringify(newOnes, null, 1))
writeFileSync('./districts_to_geocode.json', JSON.stringify(needsGeocode, null, 1))
writeFileSync('./known_centroids.json', JSON.stringify(KNOWN_CENTROIDS, null, 1))

// Sample of what got skipped as "already in DB" for a sanity check
const skippedSample = cleaned.filter((c) => existingNames.has(normName(c.name_en))).slice(0, 10)
console.log('\nsample of skipped (already-exists) matches:')
skippedSample.forEach((s) => console.log(' -', s.name_en, '|', s.woreda))
