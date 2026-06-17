// Read-only: lists public base tables and user-defined enum types.
import pg from 'pg'
const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URI, ssl: { rejectUnauthorized: false } })
try {
  const { rows: tables } = await pool.query(`
    select table_name from information_schema.tables
    where table_schema='public' and table_type='BASE TABLE' order by table_name`)
  console.log(`Tables (${tables.length}):`)
  for (const t of tables) console.log('  ' + t.table_name)

  const { rows: enums } = await pool.query(`
    select t.typname, count(e.enumlabel)::int as n
    from pg_type t join pg_enum e on e.enumtypid = t.oid
    join pg_namespace ns on ns.oid = t.typnamespace
    where ns.nspname = 'public'
    group by t.typname order by t.typname`)
  console.log(`\nEnum types (${enums.length}):`)
  for (const e of enums) console.log(`  ${e.typname} (${e.n} values)`)
} catch (err) {
  console.error('State check failed:', err.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
