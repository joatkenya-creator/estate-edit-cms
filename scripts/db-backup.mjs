// Read-only logical backup: exports every public table's rows to one JSON file.
// A safety net before the cutover (the rename to *_legacy also preserves data).
// Usage: DATABASE_URI must be set in the environment.
import pg from 'pg'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
  ssl: { rejectUnauthorized: false },
})

try {
  const { rows: tables } = await pool.query(`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `)

  const dump = {}
  let total = 0
  for (const t of tables) {
    const { rows } = await pool.query(`select * from "${t.table_name}"`)
    dump[t.table_name] = rows
    total += rows.length
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const dir = join(process.cwd(), 'backups')
  mkdirSync(dir, { recursive: true })
  const file = join(dir, `pre-cutover-${stamp}.json`)
  writeFileSync(file, JSON.stringify(dump, null, 2), 'utf8')

  console.log(`Backed up ${tables.length} tables, ${total} rows total.`)
  console.log(`Saved: ${file}`)
} catch (err) {
  console.error('Backup failed:', err.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
