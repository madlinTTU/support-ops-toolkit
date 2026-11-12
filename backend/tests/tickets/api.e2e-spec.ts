import { Test } from '@nestjs/testing'
import type { INestApplication } from '@nestjs/common'
import type pg from 'pg'
import request from 'supertest'
import type { App } from 'supertest/types.js'
import { AnalyticsModule } from '../../src/analytics/analytics.module.js'
import { setupApp } from '../../src/app.setup.js'
import { PG_POOL } from '../../src/database/database.module.js'
import { KbModule } from '../../src/knowledge-base/kb.module.js'
import { TicketsModule } from '../../src/tickets/tickets.module.js'
import { startTestDatabase } from '../analytics/test-database.js'

// Needs Docker: every run starts a clean PostgreSQL container.
interface TestTicket {
  status?: string
  priority?: string | null
  category?: string | null
  escalated?: boolean
  dueInMinutes?: number | null
  firstResponseAt?: Date | null
}

describe('API', () => {
  let pool: pg.Pool
  let stopDatabase: () => Promise<void>
  let app: INestApplication<App>

  beforeAll(async () => {
    const database = await startTestDatabase()
    pool = database.pool
    stopDatabase = database.stop

    const moduleRef = await Test.createTestingModule({ imports: [TicketsModule, AnalyticsModule, KbModule] })
      .overrideProvider(PG_POOL)
      .useValue(pool)
      .compile()
    app = moduleRef.createNestApplication()
    setupApp(app)
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    await stopDatabase()
  })

  beforeEach(async () => {
    await pool.query('TRUNCATE tickets, kb_candidates RESTART IDENTITY CASCADE')
  })

  async function insertTicket(ticket: TestTicket = {}): Promise<number> {
    const now = Date.now()
    const dueAt =
      ticket.dueInMinutes === undefined || ticket.dueInMinutes === null
        ? null
        : new Date(now + ticket.dueInMinutes * 60_000)
    const result = await pool.query<{ id: number }>(
      `INSERT INTO tickets (subject, body, customer_email, channel, status, priority, category, escalated,
                            created_at, sla_due_at, first_response_at)
       VALUES ('Subject', 'Body', 'customer@example.com', 'email', $1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        ticket.status ?? 'queued',
        ticket.priority === undefined ? 'normal' : ticket.priority,
        ticket.category === undefined ? 'bug' : ticket.category,
        ticket.escalated ?? false,
        new Date(now - 60 * 60_000),
        dueAt,
        ticket.firstResponseAt ?? null,
      ],
    )
    return result.rows[0].id
  }

  describe('GET /api/tickets', () => {
    it('listTickets_mixedPriorities_returnsMostUrgentFirst', async () => {
      const normal = await insertTicket({ priority: 'normal', dueInMinutes: 100 })
      const criticalLater = await insertTicket({ priority: 'critical', dueInMinutes: 180 })
      const criticalSooner = await insertTicket({ priority: 'critical', dueInMinutes: 60 })
      const high = await insertTicket({ priority: 'high', dueInMinutes: 300 })
      const low = await insertTicket({ priority: 'low', dueInMinutes: 10 })
      const untriaged = await insertTicket({ status: 'new', priority: null, category: null, dueInMinutes: null })

      const response = await request(app.getHttpServer()).get('/api/tickets').expect(200)

      const ids = response.body.map((ticket: { id: number }) => ticket.id)
      expect(ids).toEqual([criticalSooner, criticalLater, high, normal, low, untriaged])
    })

    it('listTickets_openTicket_includesMinutesLeftUntilDeadline', async () => {
      await insertTicket({ dueInMinutes: 90 })
      await insertTicket({ dueInMinutes: -30 })

      const response = await request(app.getHttpServer()).get('/api/tickets').expect(200)

      const minutesLeft = response.body.map((ticket: { minutesLeft: number }) => ticket.minutesLeft)
      expect(minutesLeft[0]).toBeLessThanOrEqual(-29)
      expect(minutesLeft[0]).toBeGreaterThanOrEqual(-31)
      expect(minutesLeft[1]).toBeLessThanOrEqual(90)
      expect(minutesLeft[1]).toBeGreaterThanOrEqual(89)
    })

    it('listTickets_closedTicket_hasNoMinutesLeft', async () => {
      await insertTicket({ status: 'closed', dueInMinutes: 90 })

      const response = await request(app.getHttpServer()).get('/api/tickets').expect(200)

      expect(response.body[0].minutesLeft).toBeNull()
    })

    it('listTickets_statusFilter_returnsOnlyThatStatus', async () => {
      await insertTicket({ status: 'queued' })
      const inProgress = await insertTicket({ status: 'in_progress' })

      const response = await request(app.getHttpServer()).get('/api/tickets?status=in_progress').expect(200)

      expect(response.body.map((ticket: { id: number }) => ticket.id)).toEqual([inProgress])
    })

    it('listTickets_categoryAndEscalatedFilters_returnMatchingTickets', async () => {
      await insertTicket({ category: 'billing', escalated: false })
      const wanted = await insertTicket({ category: 'billing', escalated: true })
      await insertTicket({ category: 'bug', escalated: true })

      const response = await request(app.getHttpServer())
        .get('/api/tickets?category=billing&escalated=true')
        .expect(200)

      expect(response.body.map((ticket: { id: number }) => ticket.id)).toEqual([wanted])
    })

    it('listTickets_escalatedFalse_returnsOnlyNotEscalated', async () => {
      const notEscalated = await insertTicket({ escalated: false })
      await insertTicket({ escalated: true })

      const response = await request(app.getHttpServer()).get('/api/tickets?escalated=false').expect(200)

      expect(response.body.map((ticket: { id: number }) => ticket.id)).toEqual([notEscalated])
    })

    it('listTickets_unknownStatus_returns400InCommonFormat', async () => {
      const response = await request(app.getHttpServer()).get('/api/tickets?status=done').expect(400)

      expect(response.body.type).toBe('bad_request')
      expect(response.body.code).toBe('INVALID_INPUT')
      expect(response.body.message).toContain('status')
    })

    it('listTickets_emptyTable_returnsEmptyList', async () => {
      await request(app.getHttpServer()).get('/api/tickets').expect(200).expect([])
    })
  })

  describe('GET /api/tickets/:id', () => {
    it('getTicket_existingId_returnsTicket', async () => {
      const id = await insertTicket({ priority: 'high', category: 'billing', dueInMinutes: 60 })

      const response = await request(app.getHttpServer())
        .get('/api/tickets/' + id)
        .expect(200)

      expect(response.body).toMatchObject({ id, subject: 'Subject', priority: 'high', category: 'billing' })
    })

    it('getTicket_unknownId_returns404InCommonFormat', async () => {
      const response = await request(app.getHttpServer()).get('/api/tickets/999').expect(404)

      expect(response.body).toEqual({
        type: 'not_found',
        message: 'Ticket 999 does not exist',
        code: 'TICKET_NOT_FOUND',
      })
    })

    it('getTicket_idIsNotANumber_returns400', async () => {
      const response = await request(app.getHttpServer()).get('/api/tickets/abc').expect(400)

      expect(response.body.type).toBe('bad_request')
    })

    it('getTicket_idTooBigForTheDatabase_returns404', async () => {
      await request(app.getHttpServer()).get('/api/tickets/99999999999').expect(404)
    })
  })

  describe('POST /api/tickets/:id/take', () => {
    it('takeTicket_queuedTicket_movesToInProgressAndSetsFirstResponse', async () => {
      const id = await insertTicket({ status: 'queued' })

      const response = await request(app.getHttpServer()).post(`/api/tickets/${id}/take`).expect(200)

      expect(response.body.status).toBe('in_progress')
      expect(response.body.firstResponseAt).not.toBeNull()
    })

    it('takeTicket_firstResponseAlreadySet_keepsTheEarlierTime', async () => {
      const earlier = new Date('2026-06-01T10:00:00Z')
      const id = await insertTicket({ status: 'queued', firstResponseAt: earlier })

      const response = await request(app.getHttpServer()).post(`/api/tickets/${id}/take`).expect(200)

      expect(response.body.firstResponseAt).toBe(earlier.toISOString())
    })

    it('takeTicket_closedTicket_returns409', async () => {
      const id = await insertTicket({ status: 'closed' })

      const response = await request(app.getHttpServer()).post(`/api/tickets/${id}/take`).expect(409)

      expect(response.body.type).toBe('conflict')
      expect(response.body.code).toBe('INVALID_STATUS_CHANGE')
    })

    it('takeTicket_ticketAlreadyInProgress_returns409', async () => {
      const id = await insertTicket({ status: 'in_progress' })

      await request(app.getHttpServer()).post(`/api/tickets/${id}/take`).expect(409)
    })

    it('takeTicket_unknownId_returns404', async () => {
      const response = await request(app.getHttpServer()).post('/api/tickets/999/take').expect(404)

      expect(response.body.code).toBe('TICKET_NOT_FOUND')
    })
  })

  describe('POST /api/tickets/:id/close', () => {
    it('closeTicket_inProgressTicket_closesWithResolution', async () => {
      const id = await insertTicket({ status: 'in_progress', dueInMinutes: 60 })

      const response = await request(app.getHttpServer())
        .post(`/api/tickets/${id}/close`)
        .send({ resolution: '  Password was reset.  ' })
        .expect(200)

      expect(response.body.status).toBe('closed')
      expect(response.body.closedAt).not.toBeNull()
      expect(response.body.resolution).toBe('Password was reset.')
      expect(response.body.minutesLeft).toBeNull()
    })

    it('closeTicket_missingResolution_returns400', async () => {
      const id = await insertTicket({ status: 'in_progress' })

      const response = await request(app.getHttpServer()).post(`/api/tickets/${id}/close`).send({}).expect(400)

      expect(response.body.type).toBe('bad_request')
      expect(response.body.message).toContain('resolution')
    })

    it('closeTicket_blankResolution_returns400', async () => {
      const id = await insertTicket({ status: 'in_progress' })

      await request(app.getHttpServer()).post(`/api/tickets/${id}/close`).send({ resolution: '   ' }).expect(400)
    })

    it('closeTicket_queuedTicket_returns409AndKeepsTheTicketOpen', async () => {
      const id = await insertTicket({ status: 'queued' })

      const response = await request(app.getHttpServer())
        .post(`/api/tickets/${id}/close`)
        .send({ resolution: 'Done' })
        .expect(409)

      expect(response.body.code).toBe('INVALID_STATUS_CHANGE')
      const ticket = await request(app.getHttpServer()).get('/api/tickets/' + id)
      expect(ticket.body.status).toBe('queued')
    })

    it('closeTicket_unknownId_returns404', async () => {
      await request(app.getHttpServer()).post('/api/tickets/999/close').send({ resolution: 'Done' }).expect(404)
    })
  })

  describe('POST /api/tickets/:id/escalate', () => {
    it('escalateTicket_openTicket_marksEscalated', async () => {
      const id = await insertTicket({ status: 'queued' })

      const response = await request(app.getHttpServer()).post(`/api/tickets/${id}/escalate`).expect(200)

      expect(response.body.escalated).toBe(true)
      expect(response.body.escalatedAt).not.toBeNull()
    })

    it('escalateTicket_alreadyEscalated_keepsTheFirstEscalationTime', async () => {
      const id = await insertTicket({ status: 'queued' })
      const first = await request(app.getHttpServer()).post(`/api/tickets/${id}/escalate`).expect(200)

      const second = await request(app.getHttpServer()).post(`/api/tickets/${id}/escalate`).expect(200)

      expect(second.body.escalatedAt).toBe(first.body.escalatedAt)
    })

    it('escalateTicket_closedTicket_returns409', async () => {
      const id = await insertTicket({ status: 'closed' })

      await request(app.getHttpServer()).post(`/api/tickets/${id}/escalate`).expect(409)
    })

    it('escalateTicket_unknownId_returns404', async () => {
      await request(app.getHttpServer()).post('/api/tickets/999/escalate').expect(404)
    })
  })

  describe('GET /api/summary', () => {
    it('getSummary_smallDataSet_returnsOpenEscalatedAndOnTimeRate', async () => {
      await insertTicket({ status: 'queued', escalated: true })
      await insertTicket({ status: 'in_progress' })
      await insertTicket({ status: 'closed', escalated: true })
      const closedOnTime = await insertTicket({ status: 'closed', dueInMinutes: 60 })
      const closedLate = await insertTicket({ status: 'closed', dueInMinutes: -60 })
      await pool.query('UPDATE tickets SET closed_at = now() WHERE id = ANY($1)', [[closedOnTime, closedLate]])

      const response = await request(app.getHttpServer()).get('/api/summary').expect(200)

      expect(response.body).toEqual({
        openCount: 2,
        escalatedCount: 1,
        closedCount: 2,
        onTimeCount: 1,
        onTimePercent: 50,
      })
    })

    it('getSummary_emptyTable_returnsZeros', async () => {
      await request(app.getHttpServer())
        .get('/api/summary')
        .expect(200)
        .expect({ openCount: 0, escalatedCount: 0, closedCount: 0, onTimeCount: 0, onTimePercent: 0 })
    })
  })

  describe('GET /api/stats', () => {
    it('statsEndpoints_emptyTable_return200WithoutErrors', async () => {
      await request(app.getHttpServer()).get('/api/stats/volume-by-category').expect(200).expect([])
      await request(app.getHttpServer()).get('/api/stats/response-times').expect(200).expect([])
      await request(app.getHttpServer()).get('/api/stats/top-recurring').expect(200).expect([])
      const perDay = await request(app.getHttpServer()).get('/api/stats/tickets-per-day').expect(200)
      expect(perDay.body).toHaveLength(30)
    })

    it('statsEndpoints_oneTicketToday_showItInTheStatistics', async () => {
      await insertTicket({ category: 'billing', priority: 'high' })
      await pool.query("UPDATE tickets SET first_response_at = created_at + interval '30 minutes'")

      const volume = await request(app.getHttpServer()).get('/api/stats/volume-by-category').expect(200)
      const responseTimes = await request(app.getHttpServer()).get('/api/stats/response-times').expect(200)

      expect(volume.body).toEqual([{ category: 'billing', ticketCount: 1, percent: 100 }])
      expect(responseTimes.body).toEqual([
        { priority: 'high', ticketCount: 1, averageMinutes: 30, medianMinutes: 30, p90Minutes: 30 },
      ])
    })

    it('topRecurring_candidatesExist_returnsThemWithMostTicketsFirst', async () => {
      await insertCandidate('Few tickets', 3)
      await insertCandidate('Many tickets', 9)

      const response = await request(app.getHttpServer()).get('/api/stats/top-recurring').expect(200)

      expect(response.body.map((row: { subject: string }) => row.subject)).toEqual(['Many tickets', 'Few tickets'])
    })
  })

  async function insertCandidate(subject: string, ticketCount: number, exampleText = ''): Promise<number> {
    const result = await pool.query<{ id: number }>(
      `INSERT INTO kb_candidates (category, representative_subject, ticket_count, first_seen_at, last_seen_at,
                                  representative_body)
       VALUES ('bug', $1, $2, now(), now(), $3) RETURNING id`,
      [subject, ticketCount, exampleText],
    )
    return result.rows[0].id
  }

  describe('/api/kb-candidates', () => {
    it('listCandidates_twoCandidates_returnsThemWithMostTicketsFirst', async () => {
      await insertCandidate('Few tickets', 3)
      await insertCandidate('Many tickets', 9, 'The export button does nothing.')

      const response = await request(app.getHttpServer()).get('/api/kb-candidates').expect(200)

      expect(response.body.map((row: { subject: string }) => row.subject)).toEqual(['Many tickets', 'Few tickets'])
      expect(response.body[0]).toMatchObject({
        category: 'bug',
        ticketCount: 9,
        status: 'proposed',
        exampleText: 'The export button does nothing.',
      })
    })

    it('decideCandidate_accepted_savesTheStatus', async () => {
      const id = await insertCandidate('Subject', 5)

      const response = await request(app.getHttpServer())
        .patch('/api/kb-candidates/' + id)
        .send({ status: 'accepted' })
        .expect(200)

      expect(response.body).toMatchObject({ id, status: 'accepted' })
    })

    it('decideCandidate_dismissed_savesTheStatus', async () => {
      const id = await insertCandidate('Subject', 5)

      const response = await request(app.getHttpServer())
        .patch('/api/kb-candidates/' + id)
        .send({ status: 'dismissed' })
        .expect(200)

      expect(response.body.status).toBe('dismissed')
    })

    it('decideCandidate_statusProposed_returns400', async () => {
      const id = await insertCandidate('Subject', 5)

      await request(app.getHttpServer())
        .patch('/api/kb-candidates/' + id)
        .send({ status: 'proposed' })
        .expect(400)
    })

    it('decideCandidate_unknownId_returns404', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/kb-candidates/999')
        .send({ status: 'accepted' })
        .expect(404)

      expect(response.body.code).toBe('KB_CANDIDATE_NOT_FOUND')
    })
  })

  describe('Swagger', () => {
    it('swaggerDocument_allEndpoints_arePresent', async () => {
      const response = await request(app.getHttpServer()).get('/api/docs-json').expect(200)

      const operations = Object.entries(response.body.paths as Record<string, object>).flatMap(([path, methods]) =>
        Object.keys(methods).map((method) => method.toUpperCase() + ' ' + path),
      )
      expect(operations.sort()).toEqual(
        [
          'GET /api/kb-candidates',
          'PATCH /api/kb-candidates/{id}',
          'GET /api/stats/response-times',
          'GET /api/stats/tickets-per-day',
          'GET /api/stats/top-recurring',
          'GET /api/stats/volume-by-category',
          'GET /api/summary',
          'GET /api/tickets',
          'GET /api/tickets/{id}',
          'POST /api/tickets/{id}/close',
          'POST /api/tickets/{id}/escalate',
          'POST /api/tickets/{id}/take',
        ].sort(),
      )
    })
  })
})
