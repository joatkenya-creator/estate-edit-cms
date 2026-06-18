import pg from 'pg'
const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URI, ssl: { rejectUnauthorized: false } })
try {
  const { rows } = await pool.query(
    'select slug, title, category, status, _status from public.assets order by sort_order',
  )
  for (const x of rows) {
    console.log(`- [${x._status}] ${x.title}  (slug=${x.slug}, ${x.category}/${x.status})`)
  }
} finally {
  await pool.end()
}
