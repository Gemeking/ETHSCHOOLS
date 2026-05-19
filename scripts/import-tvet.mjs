import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://jkvonmowcpmomoafazmc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_XbyQBZ72ubqF2qIWVAbK4A_66vYTUKr'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const raw = JSON.parse(readFileSync(join(__dirname, '../data/tvet_institutes.json'), 'utf-8'))

const institutes = raw.map((s) => ({
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
  fee_min: s.fee_min ?? 0,
  fee_max: s.fee_max ?? 0,
  phone: s.phone || null,
  email: s.email || null,
  website: s.website || null,
  description: s.description || null,
  established: s.established || null,
  verified: s.verified || false,
  coordinates_accuracy: s.coordinates_accuracy || 'low',
  tags: Array.isArray(s.tags) ? s.tags : [],
  images: Array.isArray(s.images) ? s.images : [],
  image_url: s.image_url || null,
}))

console.log(`\n🔧 Importing ${institutes.length} TVET institutes into Supabase...\n`)

let success = 0
let failed = 0
let constraintFailed = 0

for (const inst of institutes) {
  const { error } = await supabase.from('schools').insert(inst)
  if (error) {
    // If school_type 'tvet' is not allowed by DB constraint, retry with 'public'
    if (error.message.includes('violates check constraint') || error.message.includes('school_type')) {
      console.log(`  ⚠️  Constraint on school_type — retrying as 'public': ${inst.name_en}`)
      const fallback = { ...inst, school_type: 'public' }
      const { error: err2 } = await supabase.from('schools').insert(fallback)
      if (err2) {
        console.log(`  ❌ Failed (fallback): ${inst.name_en} — ${err2.message}`)
        failed++
      } else {
        console.log(`  ✅ Imported (as public): ${inst.name_en}`)
        constraintFailed++
        success++
      }
    } else {
      console.log(`  ❌ Failed: ${inst.name_en} — ${error.message}`)
      failed++
    }
  } else {
    console.log(`  ✅ Imported: ${inst.name_en}`)
    success++
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`✅ Success: ${success} institutes`)
if (constraintFailed > 0) console.log(`⚠️  Fell back to 'public' type: ${constraintFailed} (DB has no 'tvet' enum value yet)`)
if (failed > 0) console.log(`❌ Failed:  ${failed} institutes`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`\n🎉 Done! Check Supabase dashboard to verify.\n`)
