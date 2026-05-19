/**
 * Run this script AFTER adding 'tvet' to the Supabase schools.school_type CHECK constraint.
 *
 * In Supabase SQL Editor, run:
 *   ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_school_type_check;
 *   ALTER TABLE schools ADD CONSTRAINT schools_school_type_check
 *     CHECK (school_type IN ('international', 'private', 'public', 'tvet'));
 *
 * Then run this script: node scripts/update-tvet-type.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jkvonmowcpmomoafazmc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_XbyQBZ72ubqF2qIWVAbK4A_66vYTUKr'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

console.log('\n🔧 Updating TVET institutes from school_type="public" → "tvet"...\n')

// Find all schools with the 'tvet' tag that are currently stored as 'public'
const { data: tvetSchools, error: fetchError } = await supabase
  .from('schools')
  .select('id, name_en, school_type')
  .contains('tags', ['tvet'])
  .eq('school_type', 'public')

if (fetchError) {
  console.error('❌ Failed to fetch schools:', fetchError.message)
  process.exit(1)
}

console.log(`Found ${tvetSchools.length} TVET schools stored as 'public'.\n`)

let success = 0
let failed = 0

for (const school of tvetSchools) {
  const { error } = await supabase
    .from('schools')
    .update({ school_type: 'tvet' })
    .eq('id', school.id)

  if (error) {
    console.log(`  ❌ Failed: ${school.name_en} (id=${school.id}) — ${error.message}`)
    failed++
  } else {
    console.log(`  ✅ Updated: ${school.name_en}`)
    success++
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`✅ Updated: ${success}`)
if (failed > 0) console.log(`❌ Failed:  ${failed}`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
