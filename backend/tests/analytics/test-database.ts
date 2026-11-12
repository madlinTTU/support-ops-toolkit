import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import pg from 'pg'

const MIGRATIONS_DIR = fileURLToPath(new URL('../../migrations/', import.meta.url))

// Starts a clean PostgreSQL in Docker and applies our real migrations (the "Up" part of every file).
export async function startTestDatabase() {
  const container = await new PostgreSqlContainer('postgres:17-alpine').start()
  const pool = new pg.Pool({ connectionString: container.getConnectionUri() })
  for (const file of readdirSync(MIGRATIONS_DIR).sort()) {
    const sql = readFileSync(MIGRATIONS_DIR + file, 'utf8')
    await pool.query(sql.split('-- Down Migration')[0])
  }
  return {
    pool,
    stop: async () => {
      await pool.end()
      await container.stop()
    },
  }
}
