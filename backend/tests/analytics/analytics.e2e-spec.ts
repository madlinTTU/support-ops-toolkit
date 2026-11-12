import type pg from 'pg'
import { AnalyticsService } from '../../src/analytics/analytics.service.js'
import { startTestDatabase } from './test-database.js'

// Needs Docker: every run starts a clean PostgreSQL container.
const now = new Date('2026-06-30T12:00:00Z')

interface TestTicket {
  priority: string | null
  category: string | null
  status: string
  createdAt: string
  dueAt?: string
  firstResponseAt?: string
  closedAt?: string
}

describe('AnalyticsService', () => {
  let pool: pg.Pool
  let stop: () => Promise<void>
  let service: AnalyticsService

  beforeAll(async () => {
    const database = await startTestDatabase()
    pool = database.pool
    stop = database.stop
    service = new AnalyticsService(pool)
  })

  afterAll(async () => {
    await stop()
  })

  beforeEach(async () => {
    await pool.query('TRUNCATE tickets, kb_candidates RESTART IDENTITY CASCADE')
  })

  async function insertTicket(ticket: TestTicket) {
    await pool.query(
      `INSERT INTO tickets (subject, body, customer_email, channel, priority, category, status,
                            created_at, sla_due_at, first_response_at, closed_at)
       VALUES ('subject', 'body', 'customer@example.com', 'email', $1, $2, $3, $4, $5, $6, $7)`,
      [
        ticket.priority,
        ticket.category,
        ticket.status,
        ticket.createdAt,
        ticket.dueAt ?? null,
        ticket.firstResponseAt ?? null,
        ticket.closedAt ?? null,
      ],
    )
  }

  // Today is 2026-06-30, so the 30 day window is 2026-06-01 to 2026-06-30.
  async function insertSmallDataSet() {
    // Critical, due after 4 hours.
    await insertTicket({
      priority: 'critical',
      category: 'billing',
      status: 'closed',
      createdAt: '2026-06-10T10:00:00Z',
      dueAt: '2026-06-10T14:00:00Z',
      firstResponseAt: '2026-06-10T10:30:00Z',
      closedAt: '2026-06-10T14:00:00Z',
    }) // 30 min, on time (exactly at the deadline)
    await insertTicket({
      priority: 'critical',
      category: 'billing',
      status: 'closed',
      createdAt: '2026-06-11T10:00:00Z',
      dueAt: '2026-06-11T14:00:00Z',
      firstResponseAt: '2026-06-11T11:30:00Z',
      closedAt: '2026-06-11T15:00:00Z',
    }) // 90 min, late
    // High, due after 8 hours.
    await insertTicket({
      priority: 'high',
      category: 'account_access',
      status: 'closed',
      createdAt: '2026-06-12T08:00:00Z',
      dueAt: '2026-06-12T16:00:00Z',
      firstResponseAt: '2026-06-12T08:45:00Z',
      closedAt: '2026-06-12T15:00:00Z',
    }) // 45 min, on time
    // Normal, due after 24 hours.
    await insertTicket({
      priority: 'normal',
      category: 'bug',
      status: 'closed',
      createdAt: '2026-06-13T09:00:00Z',
      dueAt: '2026-06-14T09:00:00Z',
      firstResponseAt: '2026-06-13T10:00:00Z',
      closedAt: '2026-06-14T10:00:00Z',
    }) // 60 min, late
    await insertTicket({
      priority: 'normal',
      category: 'bug',
      status: 'closed',
      createdAt: '2026-06-13T11:00:00Z',
      dueAt: '2026-06-14T11:00:00Z',
      firstResponseAt: '2026-06-13T13:00:00Z',
      closedAt: '2026-06-14T12:00:00Z',
    }) // 120 min, late
    await insertTicket({
      priority: 'normal',
      category: 'how_to',
      status: 'closed',
      createdAt: '2026-06-15T09:00:00Z',
      dueAt: '2026-06-16T09:00:00Z',
      firstResponseAt: '2026-06-15T12:00:00Z',
      closedAt: '2026-06-16T08:00:00Z',
    }) // 180 min, on time
    await insertTicket({
      priority: 'normal',
      category: 'how_to',
      status: 'in_progress',
      createdAt: '2026-06-20T09:00:00Z',
      dueAt: '2026-06-21T09:00:00Z',
      firstResponseAt: '2026-06-20T13:00:00Z',
    }) // 240 min, still open
    // Not answered yet.
    await insertTicket({
      priority: 'low',
      category: 'other',
      status: 'queued',
      createdAt: '2026-06-30T08:00:00Z',
      dueAt: '2026-07-03T08:00:00Z',
    })
    // Too old for the 30 day window.
    await insertTicket({
      priority: 'low',
      category: 'billing',
      status: 'queued',
      createdAt: '2026-05-01T10:00:00Z',
      dueAt: '2026-05-04T10:00:00Z',
    })
    // Not triaged yet.
    await insertTicket({ priority: null, category: null, status: 'new', createdAt: '2026-06-25T10:00:00Z' })
  }

  describe('onTimeRate', () => {
    it('onTimeRate_smallDataSet_returnsRatePerPriorityAndTotal', async () => {
      await insertSmallDataSet()

      // critical: 1 of 2 on time (50%), high: 1 of 1 (100%), normal: 1 of 3 (33.3%), total: 3 of 6 (50%).
      expect(await service.onTimeRate()).toEqual([
        { priority: 'critical', closedCount: 2, onTimeCount: 1, onTimePercent: 50 },
        { priority: 'high', closedCount: 1, onTimeCount: 1, onTimePercent: 100 },
        { priority: 'normal', closedCount: 3, onTimeCount: 1, onTimePercent: 33.3 },
        { priority: null, closedCount: 6, onTimeCount: 3, onTimePercent: 50 },
      ])
    })

    it('onTimeRate_emptyTable_returnsOnlyTotalWithZeros', async () => {
      expect(await service.onTimeRate()).toEqual([{ priority: null, closedCount: 0, onTimeCount: 0, onTimePercent: 0 }])
    })
  })

  describe('volumeByCategory', () => {
    it('volumeByCategory_smallDataSet_returnsCountAndPercentForLast30Days', async () => {
      await insertSmallDataSet()

      // 9 tickets in the window (the one from May is left out): 2/9 = 22.2%, 1/9 = 11.1%.
      expect(await service.volumeByCategory(now)).toEqual([
        { category: 'billing', ticketCount: 2, percent: 22.2 },
        { category: 'bug', ticketCount: 2, percent: 22.2 },
        { category: 'how_to', ticketCount: 2, percent: 22.2 },
        { category: 'account_access', ticketCount: 1, percent: 11.1 },
        { category: 'other', ticketCount: 1, percent: 11.1 },
        { category: 'untriaged', ticketCount: 1, percent: 11.1 },
      ])
    })

    it('volumeByCategory_emptyTable_returnsNoRows', async () => {
      expect(await service.volumeByCategory(now)).toEqual([])
    })
  })

  describe('topRecurring', () => {
    it('topRecurring_elevenCandidates_returnsTenWithMostTickets', async () => {
      for (let count = 1; count <= 11; count++) {
        await pool.query(
          `INSERT INTO kb_candidates (category, representative_subject, ticket_count, first_seen_at, last_seen_at)
           VALUES ('bug', $1, $2, now(), now())`,
          ['Subject ' + count, count],
        )
      }

      const rows = await service.topRecurring()

      expect(rows).toHaveLength(10)
      expect(rows.map((row) => row.ticketCount)).toEqual([11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
      expect(rows[0]).toEqual({ id: 11, category: 'bug', subject: 'Subject 11', ticketCount: 11 })
    })

    it('topRecurring_emptyTable_returnsNoRows', async () => {
      expect(await service.topRecurring()).toEqual([])
    })
  })

  describe('responseTimes', () => {
    it('responseTimes_smallDataSet_returnsAverageMedianAndP90PerPriority', async () => {
      await insertSmallDataSet()

      // critical: 30 and 90 min. Average 60, median 60, p90 = 30 + 0.9 * (90 - 30) = 84.
      // high: 45 min only. normal: 60, 120, 180, 240 min. Average 150, median 150, p90 = 180 + 0.7 * (240 - 180) = 222.
      // The queued and the untriaged tickets have no first response and are not counted.
      expect(await service.responseTimes()).toEqual([
        { priority: 'critical', ticketCount: 2, averageMinutes: 60, medianMinutes: 60, p90Minutes: 84 },
        { priority: 'high', ticketCount: 1, averageMinutes: 45, medianMinutes: 45, p90Minutes: 45 },
        { priority: 'normal', ticketCount: 4, averageMinutes: 150, medianMinutes: 150, p90Minutes: 222 },
      ])
    })

    it('responseTimes_emptyTable_returnsNoRows', async () => {
      expect(await service.responseTimes()).toEqual([])
    })
  })

  describe('ticketsPerDay', () => {
    it('ticketsPerDay_smallDataSet_returns30DaysIncludingZeros', async () => {
      await insertSmallDataSet()

      const rows = await service.ticketsPerDay(now)

      expect(rows).toHaveLength(30)
      expect(rows[0]).toEqual({ day: '2026-06-01', ticketCount: 0 })
      expect(rows[29]).toEqual({ day: '2026-06-30', ticketCount: 1 })
      const daysWithTickets = rows.filter((row) => row.ticketCount > 0)
      expect(daysWithTickets).toEqual([
        { day: '2026-06-10', ticketCount: 1 },
        { day: '2026-06-11', ticketCount: 1 },
        { day: '2026-06-12', ticketCount: 1 },
        { day: '2026-06-13', ticketCount: 2 },
        { day: '2026-06-15', ticketCount: 1 },
        { day: '2026-06-20', ticketCount: 1 },
        { day: '2026-06-25', ticketCount: 1 },
        { day: '2026-06-30', ticketCount: 1 },
      ])
    })

    it('ticketsPerDay_emptyTable_returns30DaysWithZeros', async () => {
      const rows = await service.ticketsPerDay(now)

      expect(rows).toHaveLength(30)
      expect(rows.every((row) => row.ticketCount === 0)).toBe(true)
    })
  })
})
