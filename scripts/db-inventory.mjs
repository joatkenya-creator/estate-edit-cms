// Read-only DB inventory: lists public tables + row counts.
// Usage: DATABASE_URI must be set in the environment.
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
  ssl: { rejectUnauthorized: false },
})

try {
  const { rows: tables } = await pool.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `)

  if (!tables.length) {
    console.log('No base tables in public schema.')
  } else {
    console.log(`Tables in public schema (${tables.length}):`)
    for (const t of tables) {
      const { rows } = await pool.query(`select count(*)::int as c from "${t.table_name}"`)
      console.log(`  ${t.table_name.padEnd(28)} ${rows[0].c} rows`)
    }
  }
} catch (err) {
  console.error('Inventory failed:', err.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
