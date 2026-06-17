// Executes a .sql file against the DB. Usage: node scripts/run-sql.mjs <path>
// DATABASE_URI must be set in the environment.
import pg from 'pg'
import { readFileSync } from 'node:fs'

const file = process.argv[2]
if (!file) {
  console.error('Provide a .sql file path.')
  process.exit(1)
}

const { Pool } = pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
  ssl: { rejectUnauthorized: false },
})

// Surface RAISE NOTICE messages from the DO blocks.
pool.on('connect', (client) => {
  client.on('notice', (n) => console.log('  notice:', n.message))
})

try {
  const sql = readFileSync(file, 'utf8')
  await pool.query(sql)
  console.log('Executed OK:', file)
} catch (err) {
  console.error('SQL error:', err.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
