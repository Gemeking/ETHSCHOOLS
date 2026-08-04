import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = readFileSync('../../.env.local', 'utf-8')
const vars = {}
for (const line of env.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) vars[m[1]] = m[2].trim()
}
const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const rows = JSON.parse(readFileSync('./final_import.json', 'utf-8'))
console.log(`Importing ${rows.length} schools in batches...\n`)

const BATCH_SIZE = 500
let success = 0, failed = 0

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE)
  const { error } = await supabase.from('schools').insert(batch)
  if (error) {
    console.log(`Batch ${i}-${i + batch.length} FAILED: ${error.message}`)
    failed += batch.length
  } else {
    success += batch.length
  }
  if ((i / BATCH_SIZE) % 10 === 0) {
    console.log(`progress: ${i + batch.length} / ${rows.length}`)
  }
}

console.log(`\n---`)
console.log(`Success: ${success}`)
console.log(`Failed: ${failed}`)
