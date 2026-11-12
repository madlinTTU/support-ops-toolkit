import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { TriageService } from '../../src/triage/triage.service.js'

const ENV_FILE = fileURLToPath(new URL('../../.env', import.meta.url))
const TEST_EMAIL = 'triage-test@example.com'

describe('TriageService', () => {
  let pool: pg.Pool
  let service: TriageService

  beforeAll(() => {
    if (existsSync(ENV_FILE)) {
      process.loadEnvFile(ENV_FILE)
    }
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
    service = new TriageService(pool)
  })

  beforeEach(async () => {
    await pool.query('DELETE FROM tickets WHERE customer_email = $1', [TEST_EMAIL])
  })

  afterAll(async () => {
    await pool.query('DELETE FROM tickets WHERE customer_email = $1', [TEST_EMAIL])
    await pool.end()
  })

  async function insertTicket(subject: string, body: string, status: string): Promise<number> {
    const { rows } = await pool.query<{ id: number }>(
      `INSERT INTO tickets (subject, body, customer_email, channel, status, created_at)
       VALUES ($1, $2, $3, 'email', $4, now()) RETURNING id`,
      [subject, body, TEST_EMAIL, status],
    )
    return rows[0]!.id
  }

  async function loadTicket(id: number) {
    const { rows } = await pool.query(
      'SELECT category, priority, tags, status, triaged_at FROM tickets WHERE id = $1',
      [id],
    )
    return rows[0]
  }

  it('triageNewTickets_newTicket_setsFieldsAndMovesToQueued', async () => {
    const id = await insertTicket('Charged twice', 'Duplicate payment on my card', 'new')

    await service.triageNewTickets()

    const ticket = await loadTicket(id)
    expect(ticket.category).toBe('billing')
    expect(ticket.priority).toBe('critical')
    expect(ticket.tags).toContain('charge')
    expect(ticket.status).toBe('queued')
    expect(ticket.triaged_at).not.toBeNull()
  })

  it('triageNewTickets_ticketAlreadyInProgress_keepsItsStatus', async () => {
    const id = await insertTicket('Cannot reset my password', 'No email arrives', 'in_progress')

    await service.triageNewTickets()

    expect((await loadTicket(id)).status).toBe('in_progress')
  })

  it('triageNewTickets_runTwice_doesNotChangeTriagedTickets', async () => {
    const id = await insertTicket('Cannot reset my password', 'No email arrives', 'new')
    await service.triageNewTickets()
    const afterFirstRun = await loadTicket(id)

    await service.triageNewTickets()

    expect(await loadTicket(id)).toEqual(afterFirstRun)
  })
})
