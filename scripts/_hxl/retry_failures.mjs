import { readFileSync, writeFileSync } from 'fs'

// Major-city centroids already established and verified during tonight's
// country-wide OSM import — reused here so well-known cities don't depend
// on a fuzzy Nominatim match at all.
const MAJOR_CITIES = {
  'bahirdar': [11.5936, 37.3908], 'gondar': [12.6030, 37.4521], 'dessie': [11.1330, 39.6330],
  'debremarkos': [10.3373, 37.7284], 'debrebirhan': [9.6788, 39.5297], 'kombolcha': [11.0842, 39.7458],
  'woldia': [11.8322, 39.6058], 'debretabor': [11.8500, 38.0167], 'lalibela': [12.0317, 39.0472],
  'finoteselam': [10.7000, 37.2667], 'injibara': [10.9500, 36.9333], 'adama': [8.5400, 39.2700],
  'bishoftu': [8.7500, 38.9833], 'jimma': [7.6731, 36.8344], 'nekemte': [9.0833, 36.5500],
  'ambo': [8.9833, 37.8500], 'woliso': [8.5333, 37.9667], 'asella': [7.9500, 39.1333],
  'shashamane': [7.2000, 38.6000], 'ziway': [7.9333, 38.7167], 'shambu': [9.5667, 37.1000],
  'metu': [8.3000, 35.5833], 'moyale': [3.5167, 39.0500], 'yabelo': [4.8833, 38.0833],
  'chiro': [9.0833, 40.8667], 'dodola': [6.9833, 39.1833], 'bulehora': [5.5981, 38.2371],
  'robe': [7.1167, 40.0000], 'fitche': [9.7833, 38.7333], 'tepi': [7.2000, 35.4167],
  'hawassa': [7.0504, 38.4955], 'arbaminch': [6.0333, 37.5500], 'wolaitasodo': [6.8333, 37.7667],
  'hosaena': [7.5500, 37.8500], 'wolkite': [8.2833, 37.7833], 'bonga': [7.2667, 36.2333],
  'mekelle': [13.4967, 39.4753], 'adigrat': [14.2667, 39.4667], 'axum': [14.1211, 38.7233],
  'shire': [14.1061, 38.2842], 'diredawa': [9.5931, 41.8661], 'harar': [9.3141, 42.1181],
  'jijiga': [9.3500, 42.8000], 'kebridehar': [6.7333, 44.2667], 'gode': [5.9500, 43.5667],
  'semera': [11.7833, 41.0167], 'asaita': [11.5667, 41.6500], 'assosa': [10.0667, 34.5333],
  'gambella': [8.2500, 34.5833], 'jinka': [5.7833, 36.5667], 'arbaminchtown': [6.0333, 37.5500],
}

function normCity(s) {
  return s.toLowerCase().replace(/\btown\b|\bzuria\b|\(am\)|\(sw shewa\)/gi, '').replace(/[^a-z0-9]/g, '')
}

function cleanQuery(woreda, zone, region) {
  const cleaned = woreda.replace(/\btown\b/gi, '').replace(/\bzuria\b/gi, '').replace(/\/.*$/, '').replace(/\(.*?\)/g, '').trim()
  return `${cleaned}, ${zone}, ${region}, Ethiopia`
}

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({ q: query, format: 'json', limit: '1', countrycodes: 'et' })
  const res = await fetch(url, { headers: { 'User-Agent': 'ethioschool.et district geocoding retry pass' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data[0] ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null
}

const failures = JSON.parse(readFileSync('./geocode_failures.json', 'utf-8'))
const alreadyGeocoded = JSON.parse(readFileSync('./geocoded_districts.json', 'utf-8'))

const newlyResolved = []
const stillFailing = []

let idx = 0
for (const f of failures) {
  idx++
  const cityKey = normCity(f.woreda)
  if (MAJOR_CITIES[cityKey]) {
    const [lat, lon] = MAJOR_CITIES[cityKey]
    newlyResolved.push({ key: f.key, region: f.region, zone: f.zone, woreda: f.woreda, count: f.count, lat, lon })
    console.log(`[${idx}/${failures.length}] KNOWN ${f.woreda} -> ${lat},${lon}`)
    continue
  }

  try {
    const found = await geocode(cleanQuery(f.woreda, f.zone, f.region))
    await new Promise((r) => setTimeout(r, 1100))
    if (found) {
      newlyResolved.push({ key: f.key, region: f.region, zone: f.zone, woreda: f.woreda, count: f.count, lat: found.lat, lon: found.lon })
      console.log(`[${idx}/${failures.length}] RETRY-OK ${f.woreda} -> ${found.lat},${found.lon}`)
    } else {
      stillFailing.push(f)
      console.log(`[${idx}/${failures.length}] STILL FAIL ${f.woreda}`)
    }
  } catch (e) {
    stillFailing.push(f)
    console.log(`[${idx}/${failures.length}] ERROR ${f.woreda}: ${e.message}`)
    await new Promise((r) => setTimeout(r, 1100))
  }
}

writeFileSync('./geocoded_districts.json', JSON.stringify([...alreadyGeocoded, ...newlyResolved], null, 1))
writeFileSync('./geocode_failures.json', JSON.stringify(stillFailing, null, 1))
console.log(`\nRecovered: ${newlyResolved.length}, still failing (will use region-level fallback): ${stillFailing.length}`)
