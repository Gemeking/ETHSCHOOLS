import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://jkvonmowcpmomoafazmc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_XbyQBZ72ubqF2qIWVAbK4A_66vYTUKr'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const NEW_FROM_ID = 25

const raw = JSON.parse(readFileSync(join(__dirname, '../data/universities_ethiopia.json'), 'utf-8'))
  .filter((u) => u.id >= NEW_FROM_ID)

const universities = raw.map((u) => ({
  name_en: u.name_en,
  name_am: u.name_am || null,
  university_type: u.university_type,
  city: u.city || null,
  region: u.region || null,
  latitude: u.latitude,
  longitude: u.longitude,
  established: u.established || null,
  description: u.description || null,
  phone: u.phone || null,
  email: u.email || null,
  website: u.website || null,
  departments: u.departments || [],
  images: u.images || [],
  image_url: u.image_url || null,
  tags: u.tags || [],
  verified: u.verified || false,
  student_count: u.student_count || null,
  fee_range_etb: u.fee_range_etb || null,
}))

console.log(`\n🎓 Importing ${universities.length} universities into Supabase...\n`)

let success = 0
let failed = 0

for (const uni of universities) {
  const { error } = await supabase.from('universities').insert(uni)
  if (error) {
    console.log(`  ❌ Failed: ${uni.name_en} — ${error.message}`)
    failed++
  } else {
    console.log(`  ✅ Imported: ${uni.name_en}`)
    success++
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`✅ Success: ${success} universities`)
if (failed > 0) console.log(`❌ Failed:  ${failed} universities`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`\n🎉 Done! Open your Supabase dashboard to verify.\n`)
