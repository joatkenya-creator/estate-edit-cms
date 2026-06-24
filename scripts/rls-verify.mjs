// Verifies RLS as the `anon` role (used by the public site). Read-only:
// everything runs inside a transaction that is rolled back. Each risky query is
// wrapped in a savepoint so one failure doesn't poison the rest of the checks.
import pg from 'pg'
const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URI, ssl: { rejectUnauthorized: false } })
const c = await pool.connect()

// Run `fn` inside a savepoint; roll back to it on error so the txn stays usable.
async function attempt(label, fn) {
  await c.query('savepoint sp')
  try {
    await fn()
    await c.query('release savepoint sp')
  } catch (e) {
    await c.query('rollback to savepoint sp')
    return e.message.split('\n')[0]
  }
  return null
}

try {
  await c.query('begin')
  await c.query('set local role anon')

  // Content tables: anon should read (published rows only).
  for (const t of ['assets', 'services', 'site_stats', 'testimonials', 'sale_events']) {
    const err = await attempt(t, async () => {
      const r = await c.query(`select count(*)::int n from public.${t}`)
      console.log(`anon read public.${t}: ${r.rows[0].n} (published only)`)
    })
    if (err) console.log(`anon read public.${t}: BLOCKED (unexpected!) - ${err}`)
  }

  // Lead capture: anon may INSERT inquiries.
  {
    const err = await attempt('inquiries', () =>
      c.query(`insert into public.inquiries (inquiry_type, full_name, email, message)
               values ('consultation','RLS Test','rls@test.com','hi')`),
    )
    console.log(err ? `anon insert inquiries: FAILED (unexpected!) - ${err}` : 'anon insert inquiries: OK (allowed)')
  }

  // Content writes by anon must be blocked.
  {
    const err = await attempt('assets-insert', () =>
      c.query(`insert into public.assets (slug, title) values ('rls-x','x')`),
    )
    console.log(err ? `anon insert assets: correctly BLOCKED - ${err}` : 'anon insert assets: UNEXPECTEDLY ALLOWED (bad!)')
  }

  // Sensitive / internal tables: anon must be fully blocked (grants revoked + RLS).
  for (const t of ['users', 'users_sessions', 'media', '_assets_v', 'payload_preferences']) {
    const err = await attempt(t, async () => {
      const r = await c.query(`select count(*)::int n from public.${t}`)
      // No throw means grant exists; RLS may still hide rows. Either way, surface it.
      console.log(`anon read public.${t}: returned ${r.rows[0].n} rows${r.rows[0].n === 0 ? ' (RLS hides all — ok)' : ' — UNEXPECTEDLY VISIBLE (bad!)'}`)
    })
    if (err) console.log(`anon read public.${t}: correctly BLOCKED - ${err}`)
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
