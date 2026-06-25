// Scans every text/varchar column of the published content tables for an em
// dash (—), so we can clean DB-driven copy too. Read-only. Usage:
//   node scripts/find-emdash.mjs   (DATABASE_URI must be set)
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URI, ssl: { rejectUnauthorized: false } })

const tables = ['assets', 'services', 'testimonials', 'site_stats', 'sale_events']
let hits = 0

for (const t of tables) {
  const cols = await pool.query(
    `select column_name from information_schema.columns
     where table_schema='public' and table_name=$1
       and data_type in ('text','character varying')`,
    [t],
  )
  for (const { column_name: c } of cols.rows) {
    // Match em dash (U+2014), en dash (U+2013), and horizontal bar (U+2015).
    const r = await pool.query(
      `select id, ${'"' + c + '"'} as val from public.${t}
       where ${'"' + c + '"'} ~ '[–—―]'`,
    )
    for (const row of r.rows) {
      hits++
      const kind = /—/.test(row.val) ? 'em' : /–/.test(row.val) ? 'en' : 'bar'
      console.log(`${t}.${c}  [${kind}-dash] [id=${row.id}]\n    "${row.val}"`)
    }
  }
}

console.log(`\n${hits} field(s) contain an em dash.`)
await pool.end()
