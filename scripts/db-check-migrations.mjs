// Reports which Payload migrations are recorded as applied, and whether the
// commerce tables exist yet. Read-only. Usage: node scripts/db-check-migrations.mjs
import pg from 'pg'
const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URI, ssl: { rejectUnauthorized: false } })

const applied = await pool
  .query('select name, batch, created_at from public.payload_migrations order by created_at')
  .catch((e) => ({ rows: [{ name: '(payload_migrations missing: ' + e.message + ')' }] }))

console.log('=== Applied migrations (payload_migrations) ===')
for (const r of applied.rows) console.log(`  ${r.batch ?? '-'}  ${r.name}`)

const tables = ['orders', 'delivery', 'assets', 'inquiries']
console.log('\n=== Key tables exist? ===')
for (const t of tables) {
  const { rows } = await pool.query(`select to_regclass($1) is not null as ex`, ['public.' + t])
  console.log(`  ${t.padEnd(12)} ${rows[0].ex ? 'EXISTS' : 'missing'}`)
}

// If assets exists, does it already have a `market` column?
const col = await pool.query(
  `select column_name from information_schema.columns
   where table_schema='public' and table_name='assets' and column_name in ('market','currency')`,
)
console.log('\nassets has columns:', col.rows.map((r) => r.column_name).join(', ') || '(none of market/currency)')

await pool.end()
