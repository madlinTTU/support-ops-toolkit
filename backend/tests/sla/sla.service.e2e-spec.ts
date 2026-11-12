import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Test } from '@nestjs/testing'
import { SchedulerRegistry } from '@nestjs/schedule'
import pg from 'pg'
import { AppModule } from '../../src/app.module.js'
import { SlaService } from '../../src/sla/sla.service.js'

const ENV_FILE = fileURLToPath(new URL('../../.env', import.meta.url))
const TEST_EMAIL = 'sla-test@example.com'
const HOUR_MS = 3_600_000
const MINUTE_MS = 60_000
const now = new Date('2026-06-01T12:00:00Z')

function hoursFromNow(hours: number): Date {
  return new Date(now.getTime() + hours * HOUR_MS)
}

// Needs a running PostgreSQL with migrations applied (see DATABASE_URL in backend/.env).
describe('SlaService', () => {
  let pool: pg.Pool
  let service: SlaService

  beforeAll(() => {
    if (existsSync(ENV_FILE)) {
      process.loadEnvFile(ENV_FILE)
    }
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
    service = new SlaService(pool)
  })

  beforeEach(async () => {
    await pool.query('DELETE FROM tickets WHERE customer_email = $1', [TEST_EMAIL])
  })

  afterAll(async () => {
    await pool.query('DELETE FROM tickets WHERE customer_email = $1', [TEST_EMAIL])
    await pool.end()
  })

  async function insertTicket(status: string, createdAt: Date, dueAt: Date | null): Promise<number> {
    const { rows } = await pool.query<{ id: number }>(
      `INSERT INTO tickets (subject, body, customer_email, channel, status, created_at, sla_due_at)
       VALUES ('subject', 'body', $1, 'email', $2, $3, $4) RETURNING id`,
      [TEST_EMAIL, status, createdAt, dueAt],
    )
    return rows[0]!.id
  }

  async function loadTicket(id: number) {
    const { rows } = await pool.query('SELECT escalated, escalated_at FROM tickets WHERE id = $1', [id])
    return rows[0]
  }

  it('escalateAtRiskTickets_openTicketAtRisk_setsEscalatedAndTime', async () => {
    // 24-hour window, 1 hour left.
    const id = await insertTicket('queued', hoursFromNow(-23), hoursFromNow(1))

    await service.escalateAtRiskTickets(now)

    const ticket = await loadTicket(id)
    expect(ticket.escalated).toBe(true)
    expect(ticket.escalated_at).toEqual(now)
  })

  it('escalateAtRiskTickets_openTicketPastDeadline_isEscalated', async () => {
    const id = await insertTicket('in_progress', hoursFromNow(-30), hoursFromNow(-6))

    await service.escalateAtRiskTickets(now)

    expect((await loadTicket(id)).escalated).toBe(true)
  })

  it('escalateAtRiskTickets_openTicketWithTimeLeft_isNotEscalated', async () => {
    const id = await insertTicket('queued', hoursFromNow(-1), hoursFromNow(23))

    await service.escalateAtRiskTickets(now)

    expect((await loadTicket(id)).escalated).toBe(false)
  })

  it('escalateAtRiskTickets_closedTicketPastDeadline_isNotEscalated', async () => {
    const id = await insertTicket('closed', hoursFromNow(-30), hoursFromNow(-6))

    await service.escalateAtRiskTickets(now)

    expect((await loadTicket(id)).escalated).toBe(false)
  })

  it('escalateAtRiskTickets_ticketWithoutDeadline_isNotEscalated', async () => {
    const id = await insertTicket('queued', hoursFromNow(-30), null)

    await service.escalateAtRiskTickets(now)

    expect((await loadTicket(id)).escalated).toBe(false)
  })

  // Boundary tests: a critical ticket has a 4 hour window, so 25% of it is exactly 1 hour.
  async function isEscalatedWithTimeLeft(leftMs: number): Promise<boolean> {
    const dueAt = new Date(now.getTime() + leftMs)
    const id = await insertTicket('queued', new Date(dueAt.getTime() - 4 * HOUR_MS), dueAt)
    await service.escalateAtRiskTickets(now)
    return (await loadTicket(id)).escalated
  }

  it('escalateAtRiskTickets_justAbove25PercentLeft_isNotEscalated', async () => {
    expect(await isEscalatedWithTimeLeft(HOUR_MS + MINUTE_MS)).toBe(false)
  })

  it('escalateAtRiskTickets_exactly25PercentLeft_isNotEscalated', async () => {
    expect(await isEscalatedWithTimeLeft(HOUR_MS)).toBe(false)
  })

  it('escalateAtRiskTickets_justBelow25PercentLeft_isEscalated', async () => {
    expect(await isEscalatedWithTimeLeft(HOUR_MS - MINUTE_MS)).toBe(true)
  })

  it('escalateAtRiskTickets_exactlyAtDeadline_isEscalated', async () => {
    expect(await isEscalatedWithTimeLeft(0)).toBe(true)
  })

  it('escalateAtRiskTickets_runTwice_doesNotChangeEscalatedAt', async () => {
    const id = await insertTicket('queued', hoursFromNow(-23), hoursFromNow(1))
    await service.escalateAtRiskTickets(now)

    await service.escalateAtRiskTickets(hoursFromNow(2))

    expect((await loadTicket(id)).escalated_at).toEqual(now)
  })
})

describe('SLA job schedule', () => {
  it('appModule_started_hasScheduledJobRunningEveryFiveMinutes', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    const app = moduleRef.createNestApplication()
    await app.init()

    expect(app.get(SchedulerRegistry).getCronJobs().size).toBe(1)

    await app.close()
  })
})
