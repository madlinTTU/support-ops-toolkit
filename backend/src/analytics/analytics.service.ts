import { Inject, Injectable } from '@nestjs/common'
import pg from 'pg'
import { PG_POOL } from '../database/database.module.js'
import { ON_TIME_RATE } from './queries/on-time-rate.js'
import { RESPONSE_TIMES } from './queries/response-times.js'
import { TICKETS_PER_DAY } from './queries/tickets-per-day.js'
import { TOP_RECURRING } from './queries/top-recurring.js'
import { VOLUME_BY_CATEGORY } from './queries/volume-by-category.js'

// The row with priority null is the total over all priorities.
interface OnTimeCountsRow {
  priority: string | null
  closedCount: number
  onTimeCount: number
}

export interface OnTimeRateRow extends OnTimeCountsRow {
  onTimePercent: number
}

export interface VolumeRow {
  category: string
  ticketCount: number
  percent: number
}

export interface TopRecurringRow {
  id: number
  category: string
  subject: string
  ticketCount: number
}

export interface ResponseTimesRow {
  priority: string
  ticketCount: number
  averageMinutes: number
  medianMinutes: number
  p90Minutes: number
}

export interface TicketsPerDayRow {
  day: string
  ticketCount: number
}

@Injectable()
export class AnalyticsService {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  async onTimeRate(): Promise<OnTimeRateRow[]> {
    const result = await this.pool.query<OnTimeCountsRow>(ON_TIME_RATE)

    let closedCount = 0
    let onTimeCount = 0
    for (const row of result.rows) {
      closedCount += row.closedCount
      onTimeCount += row.onTimeCount
    }
    const total = { priority: null, closedCount, onTimeCount }

    return [...result.rows, total].map((row) => ({
      ...row,
      onTimePercent: toPercent(row.onTimeCount, row.closedCount),
    }))
  }

  // The total row is always the last one.
  async overallOnTimeRate(): Promise<OnTimeRateRow> {
    const rows = await this.onTimeRate()
    return rows[rows.length - 1]
  }

  async volumeByCategory(now: Date = new Date()): Promise<VolumeRow[]> {
    const result = await this.pool.query<VolumeRow>(VOLUME_BY_CATEGORY, [toDay(now)])
    return result.rows
  }

  async topRecurring(): Promise<TopRecurringRow[]> {
    const result = await this.pool.query<TopRecurringRow>(TOP_RECURRING)
    return result.rows
  }

  async responseTimes(): Promise<ResponseTimesRow[]> {
    const result = await this.pool.query<ResponseTimesRow>(RESPONSE_TIMES)
    return result.rows.map((row) => ({
      ...row,
      averageMinutes: roundToOneDecimal(row.averageMinutes),
      medianMinutes: roundToOneDecimal(row.medianMinutes),
      p90Minutes: roundToOneDecimal(row.p90Minutes),
    }))
  }

  async ticketsPerDay(now: Date = new Date()): Promise<TicketsPerDayRow[]> {
    const result = await this.pool.query<TicketsPerDayRow>(TICKETS_PER_DAY, [toDay(now)])
    return result.rows
  }
}

// "2026-06-30T12:00:00.000Z" becomes "2026-06-30".
function toDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function toPercent(part: number, total: number): number {
  return total === 0 ? 0 : roundToOneDecimal((part / total) * 100)
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10
}
