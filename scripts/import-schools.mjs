import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://jkvonmowcpmomoafazmc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_XbyQBZ72ubqF2qIWVAbK4A_66vYTUKr'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const raw = JSON.parse(readFileSync(join(__dirname, '../data/schools_addis_ababa.json'), 'utf-8'))

function parseFeeMin(feeEtb) {
  if (!feeEtb || feeEtb.toLowerCase().includes('free')) return 0
  const match = feeEtb.replace(/,/g, '').match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

function parseFeeMax(feeEtb) {
  if (!feeEtb || feeEtb.toLowerCase().includes('free')) return 0
  const nums = feeEtb.replace(/,/g, '').match(/\d+/g)
  return nums ? parseInt(nums[nums.length - 1]) : 0
}

// Only import the new batch (skip already-imported schools)
const NEW_FROM_ID = 206

const schools = raw.filter((s) => s.id >= NEW_FROM_ID).map((s) => ({
  name_en: s.name_en,
  name_am: s.name_am || null,
  school_type: s.school_type,
  curriculum: s.curriculum || null,
  grades: s.grades || null,
  language: s.language || null,
  sub_city: s.sub_city || null,
  woreda: s.woreda || null,
  latitude: s.latitude,
  longitude: s.longitude,
  fee_range_etb: s.fee_range_etb || null,
  fee_range_usd: s.fee_range_usd || null,
  fee_min: parseFeeMin(s.fee_range_etb),
  fee_max: parseFeeMax(s.fee_range_etb),
  phone: s.phone || null,
  email: s.email || null,
  website: s.website || null,
  description: s.description || null,
  established: s.established || null,
  verified: s.verified || false,
  coordinates_accuracy: s.coordinates_accuracy || 'low',
  tags: Array.isArray(s.tags) ? s.tags : [],
}))

console.log(`\n📚 Importing ${schools.length} new schools (IDs ${NEW_FROM_ID}+) into Supabase...\n`)

let success = 0
let failed = 0

for (const school of schools) {
  const { error } = await supabase.from('schools').insert(school)
  if (error) {
    console.log(`  ❌ Failed: ${school.name_en} — ${error.message}`)
    failed++
  } else {
    console.log(`  ✅ Imported: ${school.name_en}`)
    success++
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`✅ Success: ${success} schools`)
if (failed > 0) console.log(`❌ Failed:  ${failed} schools`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`\n🎉 Done! Open your Supabase dashboard to verify.\n`)
