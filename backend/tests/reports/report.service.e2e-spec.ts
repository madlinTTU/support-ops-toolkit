import type pg from 'pg'
import { AnalyticsService } from '../../src/analytics/analytics.service.js'
import { ReportService } from '../../src/reports/report.service.js'
import { startTestDatabase } from '../analytics/test-database.js'

// Needs Docker: every run starts a clean PostgreSQL container.
const now = new Date('2026-06-30T12:00:00Z')

describe('ReportService', () => {
  let pool: pg.Pool
  let stop: () => Promise<void>
  let service: ReportService

  beforeAll(async () => {
    const database = await startTestDatabase()
    pool = database.pool
    stop = database.stop
    service = new ReportService(pool, new AnalyticsService(pool))
  })

  afterAll(async () => {
    await stop()
  })

  beforeEach(async () => {
    await pool.query('TRUNCATE tickets, kb_candidates RESTART IDENTITY CASCADE')
  })

  async function insertTicket(
    status: string,
    createdAt: string,
    escalated: boolean,
    dueAt?: string,
    closedAt?: string,
  ) {
    await pool.query(
      `INSERT INTO tickets (subject, body, customer_email, channel, priority, status, escalated,
                            created_at, sla_due_at, closed_at)
       VALUES ('subject', 'body', 'customer@example.com', 'email', 'normal', $1, $2, $3, $4, $5)`,
      [status, escalated, createdAt, dueAt ?? null, closedAt ?? null],
    )
  }

  it('collectData_smallDataSet_returnsCountsOnTimeRateAndTopFiveCandidates', async () => {
    await insertTicket('new', '2026-06-30T10:00:00Z', false)
    await insertTicket('in_progress', '2026-06-30T01:00:00Z', true)
    await insertTicket('in_progress', '2026-06-29T11:00:00Z', true)
    await insertTicket('closed', '2026-06-29T08:00:00Z', false, '2026-06-30T08:00:00Z', '2026-06-30T07:00:00Z')
    await insertTicket('closed', '2026-06-20T08:00:00Z', false, '2026-06-21T08:00:00Z', '2026-06-21T09:00:00Z')
    for (let count = 1; count <= 6; count++) {
      await pool.query(
        `INSERT INTO kb_candidates (category, representative_subject, ticket_count, first_seen_at, last_seen_at)
         VALUES ('bug', $1, $2, now(), now())`,
        ['Subject ' + count, count],
      )
    }

    const data = await service.collectData(now)

    // Last 24 hours: the first two tickets. The one from 2026-06-29 11:00 is just outside the window.
    expect(data.date).toBe('2026-06-30')
    expect(data.receivedLast24h).toBe(2)
    expect(data.openCount).toBe(3)
    expect(data.escalatedCount).toBe(2)
    expect(data.onTime).toEqual({ priority: null, closedCount: 2, onTimeCount: 1, onTimePercent: 50 })
    expect(data.candidates.map((candidate) => candidate.ticketCount)).toEqual([6, 5, 4, 3, 2])
  })

  it('generate_emptyTable_returnsReportWithoutErrors', async () => {
    const report = await service.generate(now)

    expect(report).toContain('Tickets received in the last 24 hours: 0')
    expect(report).toContain('Open tickets: 0 (0 escalated)')
    expect(report).toContain('no closed tickets yet')
    expect(report).toContain('Top knowledge-base candidates: none yet')
  })
})
