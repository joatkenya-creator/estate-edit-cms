// Audits RLS status + policies for every table in the public schema.
// Usage: node scripts/rls-audit.mjs   (DATABASE_URI must be set)
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
  ssl: { rejectUnauthorized: false },
})

const { rows } = await pool.query(`
  select c.relname as table,
         c.relrowsecurity as rls_enabled,
         coalesce(p.cnt, 0) as policies
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  left join (
    select polrelid, count(*) cnt from pg_policy group by polrelid
  ) p on p.polrelid = c.oid
  where n.nspname = 'public' and c.relkind = 'r'
  order by c.relrowsecurity asc, c.relname;
`)

const unprotected = rows.filter((r) => !r.rls_enabled)
console.log(`\n=== ${rows.length} tables in public — ${unprotected.length} WITHOUT RLS ===\n`)
for (const r of rows) {
  const flag = r.rls_enabled ? 'RLS ON ' : 'RLS OFF'
  console.log(`  [${flag}] ${r.table}  (policies: ${r.policies})`)
}
console.log('\nUnprotected (flagged by Supabase):')
console.log(unprotected.map((r) => '  - ' + r.table).join('\n') || '  (none)')

await pool.end()
