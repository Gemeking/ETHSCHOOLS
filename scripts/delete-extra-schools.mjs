import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jkvonmowcpmomoafazmc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_XbyQBZ72ubqF2qIWVAbK4A_66vYTUKr'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Fetch all schools ordered by the database id
const { data: all, error: fetchErr } = await supabase
  .from('schools')
  .select('id, name_en')
  .order('id', { ascending: true })

if (fetchErr) {
  console.error('Failed to fetch schools:', fetchErr.message)
  process.exit(1)
}

console.log(`\nTotal schools in database: ${all.length}`)

// Keep the first 65 rows (by database id order), delete everything after
const toKeep = all.slice(0, 65)
const toDelete = all.slice(65)

if (toDelete.length === 0) {
  console.log('Nothing to delete — database already has 65 or fewer schools.\n')
  process.exit(0)
}

const deleteIds = toDelete.map(s => s.id)

console.log(`Keeping : ${toKeep.length} schools (IDs ${toKeep[0].id} – ${toKeep[toKeep.length-1].id})`)
console.log(`Deleting: ${toDelete.length} schools (IDs ${deleteIds[0]} – ${deleteIds[deleteIds.length-1]})\n`)

const { error: delErr } = await supabase
  .from('schools')
  .delete()
  .in('id', deleteIds)

if (delErr) {
  console.error('Delete failed:', delErr.message)
  process.exit(1)
}

console.log(`✅ Deleted ${toDelete.length} schools successfully.`)

// Verify
const { data: remaining } = await supabase.from('schools').select('id').order('id')
console.log(`✅ Schools remaining in database: ${remaining.length}\n`)
