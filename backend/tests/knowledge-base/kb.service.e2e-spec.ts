import type pg from 'pg'
import { KbService } from '../../src/knowledge-base/kb.service.js'
import { startTestDatabase } from '../analytics/test-database.js'

const TEST_EMAIL = 'kb-test@example.com'
const DAY_MS = 86_400_000
const firstDay = new Date('2026-03-01T10:00:00Z')

// Needs Docker: every run starts a clean PostgreSQL container.
// The words are invented, so these tickets never look similar to the seeded ones.
describe('KbService', () => {
  let pool: pg.Pool
  let stopDatabase: () => Promise<void>
  let service: KbService

  async function cleanUp() {
    await pool.query('DELETE FROM tickets WHERE customer_email = $1', [TEST_EMAIL])
    await pool.query(
      'DELETE FROM kb_candidates WHERE id NOT IN (SELECT kb_candidate_id FROM tickets WHERE kb_candidate_id IS NOT NULL)',
    )
  }

  beforeAll(async () => {
    const database = await startTestDatabase()
    pool = database.pool
    stopDatabase = database.stop
    service = new KbService(pool)
  })

  beforeEach(cleanUp)

  afterAll(async () => {
    await cleanUp()
    await stopDatabase()
  })

  async function insertTicket(day: number, status = 'closed'): Promise<number> {
    const { rows } = await pool.query<{ id: number }>(
      `INSERT INTO tickets (subject, body, customer_email, channel, status, category, created_at)
       VALUES ('Zorblax widget crashes on startup', 'The zorblax widget crashes every startup, quibble needed', $1, 'email', $2, 'bug', $3)
       RETURNING id`,
      [TEST_EMAIL, status, new Date(firstDay.getTime() + day * DAY_MS)],
    )
    return rows[0].id
  }

  async function loadCandidate(ticketId: number) {
    const { rows } = await pool.query(
      `SELECT c.* FROM kb_candidates c JOIN tickets t ON t.kb_candidate_id = c.id WHERE t.id = $1`,
      [ticketId],
    )
    return rows[0]
  }

  async function countCandidates(): Promise<number> {
    const { rows } = await pool.query('SELECT count(*)::int AS count FROM kb_candidates')
    return rows[0].count
  }

  it('detectCandidates_fourSimilarClosedTickets_createsOneCandidateWithDatesAndCount', async () => {
    const ids = [await insertTicket(0), await insertTicket(1), await insertTicket(2), await insertTicket(5)]

    await service.detectCandidates()

    const candidate = await loadCandidate(ids[0])
    expect(candidate.ticket_count).toBe(4)
    expect(candidate.category).toBe('bug')
    expect(candidate.representative_subject).toBe('Zorblax widget crashes on startup')
    expect(candidate.representative_body).toBe('The zorblax widget crashes every startup, quibble needed')
    expect(candidate.status).toBe('proposed')
    expect(candidate.first_seen_at).toEqual(firstDay)
    expect(candidate.last_seen_at).toEqual(new Date(firstDay.getTime() + 5 * DAY_MS))
    for (const id of ids) {
      expect((await loadCandidate(id)).id).toBe(candidate.id)
    }
  })

  it('detectCandidates_twoSimilarTickets_createsNoCandidate', async () => {
    const id = await insertTicket(0)
    await insertTicket(1)

    await service.detectCandidates()

    expect(await loadCandidate(id)).toBeUndefined()
  })

  it('detectCandidates_openTickets_areIgnored', async () => {
    const id = await insertTicket(0, 'in_progress')
    await insertTicket(1, 'in_progress')
    await insertTicket(2, 'in_progress')

    await service.detectCandidates()

    expect(await loadCandidate(id)).toBeUndefined()
  })

  it('detectCandidates_runTwice_doesNotCreateDuplicates', async () => {
    const id = await insertTicket(0)
    await insertTicket(1)
    await insertTicket(2)
    await service.detectCandidates()
    const candidatesAfterFirstRun = await countCandidates()
    const candidateId = (await loadCandidate(id)).id

    await service.detectCandidates()

    expect(await countCandidates()).toBe(candidatesAfterFirstRun)
    expect((await loadCandidate(id)).id).toBe(candidateId)
  })

  it('detectCandidates_newTicketAfterAcceptance_updatesCountAndKeepsStatus', async () => {
    const id = await insertTicket(0)
    await insertTicket(1)
    await insertTicket(2)
    await service.detectCandidates()
    const candidateId = (await loadCandidate(id)).id
    await pool.query("UPDATE kb_candidates SET status = 'accepted' WHERE id = $1", [candidateId])
    await insertTicket(3)

    await service.detectCandidates()

    const candidate = await loadCandidate(id)
    expect(candidate.id).toBe(candidateId)
    expect(candidate.ticket_count).toBe(4)
    expect(candidate.status).toBe('accepted')
  })
})
