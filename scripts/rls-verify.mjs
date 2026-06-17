// Verifies RLS as the `anon` role (used by the public site). Read-only:
// everything runs inside a transaction that is rolled back.
import pg from 'pg'
const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URI, ssl: { rejectUnauthorized: false } })
const c = await pool.connect()
try {
  await c.query('begin')
  await c.query('set local role anon')

  for (const t of ['assets', 'services', 'site_stats', 'testimonials', 'sale_events']) {
    const r = await c.query(`select count(*)::int n from public.${t}`)
    console.log(`anon read public.${t}: ${r.rows[0].n} (published only)`)
  }

  try {
    await c.query(
      `insert into public.inquiries (inquiry_type, full_name, email, message)
       values ('consultation','RLS Test','rls@test.com','hi')`,
    )
    console.log('anon insert inquiries: OK (allowed)')
  } catch (e) {
    console.log('anon insert inquiries: FAILED -', e.message.split('\n')[0])
  }

  try {
    await c.query(`insert into public.assets (slug, title) values ('rls-x','x')`)
    console.log('anon insert assets: UNEXPECTEDLY ALLOWED (bad!)')
  } catch (e) {
    console.log('anon insert assets: correctly BLOCKED -', e.message.split('\n')[0])
  }

  await c.query('rollback')
  console.log('(rolled back — no test rows persisted)')
} catch (err) {
  console.error('verify error:', err.message)
  process.exitCode = 1
} finally {
  c.release()
  await pool.end()
}
