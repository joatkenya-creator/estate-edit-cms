// Confirms the dual_market migration landed: new columns + Virginia defaults.
import pg from 'pg'
const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URI, ssl: { rejectUnauthorized: false } })

const cols = async (t) =>
  (
    await pool.query(
      `select column_name from information_schema.columns where table_schema='public' and table_name=$1`,
      [t],
    )
  ).rows.map((r) => r.column_name)

const a = await cols('assets')
const o = await cols('orders')
console.log('assets.market present:', a.includes('market'))
console.log('orders new cols:', ['market', 'state', 'postal_code', 'country', 'delivery_quote_pending'].filter((c) => o.includes(c)).join(', '))

const market = await pool.query(`select market, count(*)::int n from public.assets group by market`)
console.log('assets by market:', market.rows.map((r) => `${r.market}=${r.n}`).join(', '))

const d = await pool.query(`select va_enabled, va_flat_fee, va_fragile_surcharge,
  jsonb_object_keys(va_locality_rates) as loc from public.delivery limit 3`)
console.log('delivery va_enabled:', d.rows[0]?.va_enabled, '| va_flat_fee:', d.rows[0]?.va_flat_fee, '| va_fragile:', d.rows[0]?.va_fragile_surcharge)
const locCount = await pool.query(`select count(*)::int n from (select jsonb_object_keys(va_locality_rates) from public.delivery) x`)
console.log('VA locality rate entries:', locCount.rows[0].n)

await pool.end()
