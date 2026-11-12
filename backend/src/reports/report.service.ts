import { Inject, Injectable } from '@nestjs/common'
import pg from 'pg'
import { AnalyticsService } from '../analytics/analytics.service.js'
import { PG_POOL } from '../database/database.module.js'
import { TOP_CANDIDATES_COUNT } from './report.config.js'
import { buildDailyReport } from './report.js'
import type { DailyReportData, ReportOnTime } from './report.js'

// $1 is now. Open means not closed.
const TICKET_COUNTS = `
  SELECT count(*) FILTER (WHERE created_at > $1::timestamptz - interval '24 hours' AND created_at <= $1::timestamptz)::int
           AS "receivedLast24h",
         count(*) FILTER (WHERE status <> 'closed')::int AS "openCount",
         count(*) FILTER (WHERE status <> 'closed' AND escalated)::int AS "escalatedCount"
  FROM tickets
`

interface TicketCountsRow {
  receivedLast24h: number
  openCount: number
  escalatedCount: number
}

const NO_CLOSED_TICKETS: ReportOnTime = { closedCount: 0, onTimeCount: 0, onTimePercent: 0 }

@Injectable()
export class ReportService {
  constructor(
    @Inject(PG_POOL) private readonly pool: pg.Pool,
    private readonly analytics: AnalyticsService,
  ) {}

  async collectData(now: Date = new Date()): Promise<DailyReportData> {
    const counts = await this.pool.query<TicketCountsRow>(TICKET_COUNTS, [now])
    const onTimeRows = await this.analytics.onTimeRate()
    const recurring = await this.analytics.topRecurring()

    return {
      date: now.toISOString().slice(0, 10),
      ...counts.rows[0],
      onTime: onTimeRows.find((row) => row.priority === null) ?? NO_CLOSED_TICKETS,
      candidates: recurring.slice(0, TOP_CANDIDATES_COUNT),
    }
  }

  async generate(now: Date = new Date()): Promise<string> {
    return buildDailyReport(await this.collectData(now))
  }
}
