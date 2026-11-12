import { Test } from '@nestjs/testing'
import type { INestApplication } from '@nestjs/common'
import type pg from 'pg'
import request from 'supertest'
import type { App } from 'supertest/types.js'
import { setupApp } from '../../src/app.setup.js'
import { PG_POOL } from '../../src/database/database.module.js'
import { DemoDataService } from '../../src/demo/demo-data.service.js'
import { DemoResetService } from '../../src/demo/demo-reset.service.js'
import { DemoModule } from '../../src/demo/demo.module.js'
import { startTestDatabase } from '../analytics/test-database.js'

// Needs Docker: every run starts a clean PostgreSQL container.
const GENERATED_COUNT = 500

describe('Demo data', () => {
  let pool: pg.Pool
  let stopDatabase: () => Promise<void>
  let app: INestApplication<App>

  beforeAll(async () => {
    const database = await startTestDatabase()
    pool = database.pool
    stopDatabase = database.stop
  })

  afterAll(async () => {
    await stopDatabase()
  })

  // A new app for every test: the reset service remembers the time of the last reset.
  beforeEach(async () => {
    await pool.query('TRUNCATE tickets, kb_candidates RESTART IDENTITY CASCADE')
    const moduleRef = await Test.createTestingModule({ imports: [DemoModule] })
      .overrideProvider(PG_POOL)
      .useValue(pool)
      .compile()
    app = moduleRef.createNestApplication()
    setupApp(app)
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  async function countTickets(): Promise<number> {
    const { rows } = await pool.query('SELECT count(*)::int AS count FROM tickets')
    return rows[0].count
  }

  describe('DemoDataService', () => {
    it('regenerate_emptyDatabase_createsTriagedTicketsAndCandidates', async () => {
      const result = await app.get(DemoDataService).regenerate()

      expect(result.removedTickets).toBe(0)
      expect(result.createdTickets).toBe(GENERATED_COUNT)
      expect(await countTickets()).toBe(GENERATED_COUNT)
      const untriaged = await pool.query('SELECT count(*)::int AS count FROM tickets WHERE category IS NULL')
      expect(untriaged.rows[0].count).toBe(0)
      const candidates = await pool.query('SELECT count(*)::int AS count FROM kb_candidates')
      expect(result.candidates).toBeGreaterThan(0)
      expect(candidates.rows[0].count).toBe(result.candidates)
    })

    it('regenerate_runTwice_replacesTheGeneratedTickets', async () => {
      const service = app.get(DemoDataService)
      await service.regenerate()

      const second = await service.regenerate()

      expect(second.removedTickets).toBe(GENERATED_COUNT)
      expect(await countTickets()).toBe(GENERATED_COUNT)
    })

    it('seedIfEmpty_emptyDatabase_fillsItOnce', async () => {
      const service = app.get(DemoDataService)

      const first = await service.seedIfEmpty()
      const second = await service.seedIfEmpty()

      expect(first?.createdTickets).toBe(GENERATED_COUNT)
      expect(second).toBeNull()
      expect(await countTickets()).toBe(GENERATED_COUNT)
    })

    it('regenerate_withoutSeed_createsDifferentDataEveryTime', async () => {
      const service = app.get(DemoDataService)
      const readTexts = async () => (await pool.query('SELECT subject, body FROM tickets ORDER BY id')).rows

      const first = await service.regenerate()
      const firstTexts = await readTexts()
      const second = await service.regenerate()

      expect(second.seed).not.toBe(first.seed)
      expect(await readTexts()).not.toEqual(firstTexts)
    })

    it('regenerate_sameSeed_createsTheSameTickets', async () => {
      const service = app.get(DemoDataService)
      const now = new Date('2026-06-30T12:00:00Z')
      const readTexts = async () => (await pool.query('SELECT subject, body FROM tickets ORDER BY id')).rows

      await service.regenerate(now, 7)
      const firstTexts = await readTexts()
      await service.regenerate(now, 7)

      expect(await readTexts()).toEqual(firstTexts)
    })
  })

  describe('POST /api/demo/reset', () => {
    it('reset_emptyDatabase_returnsResultAndCreatesData', async () => {
      const response = await request(app.getHttpServer()).post('/api/demo/reset').expect(200)

      expect(response.body.createdTickets).toBe(GENERATED_COUNT)
      expect(response.body.candidates).toBeGreaterThan(0)
      expect(await countTickets()).toBe(GENERATED_COUNT)
    })

    it('reset_secondResetRightAfterTheFirst_returns429', async () => {
      await request(app.getHttpServer()).post('/api/demo/reset').expect(200)

      const response = await request(app.getHttpServer()).post('/api/demo/reset').expect(429)

      expect(response.body).toMatchObject({ type: 'too_many_requests', code: 'RESET_TOO_SOON' })
      expect(response.body.message).toContain('Wait')
    })
  })

  describe('DemoResetService', () => {
    const start = new Date('2026-06-30T12:00:00Z')

    it('reset_afterTheCooldown_works', async () => {
      const service = app.get(DemoResetService)
      await service.reset(start)

      await expect(service.reset(new Date(start.getTime() + 5_000))).rejects.toMatchObject({ code: 'RESET_TOO_SOON' })

      const result = await service.reset(new Date(start.getTime() + 11_000))
      expect(result.createdTickets).toBe(GENERATED_COUNT)
    })

    it('reset_whileAnotherResetRuns_isRefused', async () => {
      const service = app.get(DemoResetService)

      const first = service.reset(start)

      await expect(service.reset(start)).rejects.toMatchObject({ code: 'RESET_IN_PROGRESS' })
      await first
    })
  })
})
