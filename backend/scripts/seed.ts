import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { DEFAULT_COUNT, DEFAULT_SEED, PERIOD_DAYS, generateTickets } from './generator/generate-tickets.js'

const ENV_FILE = fileURLToPath(new URL('../.env', import.meta.url))

const INSERT_TICKET = `
  INSERT INTO tickets (subject, body, customer_email, channel, status, created_at, first_response_at, closed_at, resolution)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
`

async function main(): Promise<void> {
  if (existsSync(ENV_FILE)) {
    process.loadEnvFile(ENV_FILE)
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }

  const tickets = generateTickets({ count: DEFAULT_COUNT, seed: DEFAULT_SEED, now: new Date() })
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const cleared = await client.query("DELETE FROM tickets WHERE customer_email LIKE '%@example.com'")
    // Candidates are built from the tickets that were just removed.
    await client.query('DELETE FROM kb_candidates')
    for (const ticket of tickets) {
      await client.query(INSERT_TICKET, [
        ticket.subject,
        ticket.body,
        ticket.customerEmail,
        ticket.channel,
        ticket.status,
        ticket.createdAt,
        ticket.firstResponseAt,
        ticket.closedAt,
        ticket.resolution,
      ])
    }
    await client.query('COMMIT')
    const closed = tickets.filter((t) => t.status === 'closed').length
    console.log('Removed ' + cleared.rowCount + ' earlier generated tickets.')
    console.log(
      'Inserted ' + tickets.length + ' tickets over the last ' + PERIOD_DAYS + ' days (seed ' + DEFAULT_SEED + ').',
    )
    console.log('Closed: ' + closed + ', open: ' + (tickets.length - closed) + '.')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

await main()
