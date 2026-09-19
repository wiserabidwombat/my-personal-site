// Build-time / one-off only. Reads DATABASE_URL from the environment
// (see .env.local, gitignored) and applies every .sql file in db/migrations,
// in filename order, using a single multi-statement query per file.
import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL. Copy .env.example to .env.local and fill it in.')
  process.exit(1)
}

const sql = neon(DATABASE_URL)
const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'db',
  'migrations'
)

const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort()

for (const file of files) {
  const filePath = path.join(migrationsDir, file)
  const contents = await readFile(filePath, 'utf8')
  const statements = contents
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)

  console.log(`Applying ${file} (${statements.length} statement(s))...`)
  for (const statement of statements) {
    await sql.query(statement)
  }
}

console.log(`Applied ${files.length} migration file(s).`)
