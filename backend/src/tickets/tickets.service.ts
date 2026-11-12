import { Injectable } from '@nestjs/common'
import { AnalyticsService } from '../analytics/analytics.service.js'
import { ConflictError, NotFoundError } from '../web/app-error.js'
import type { ListTicketsQuery } from './dto/list-tickets-query.dto.js'
import type { SummaryResponse } from './dto/summary-response.dto.js'
import type { TicketResponse } from './dto/ticket-response.dto.js'
import { calculateMinutesLeft } from './time-left.js'
import { TicketsRepository } from './tickets.repository.js'
import type { TicketRow } from './tickets.repository.js'

@Injectable()
export class TicketsService {
  constructor(
    private readonly repository: TicketsRepository,
    private readonly analytics: AnalyticsService,
  ) {}

  async list(query: ListTicketsQuery, now: Date = new Date()): Promise<TicketResponse[]> {
    const rows = await this.repository.findAll({
      status: query.status ?? null,
      category: query.category ?? null,
      escalated: query.escalated === undefined ? null : query.escalated === 'true',
    })
    return rows.map((row) => toResponse(row, now))
  }

  async get(id: number, now: Date = new Date()): Promise<TicketResponse> {
    const row = await this.repository.findById(id)
    if (row === null) {
      throw ticketNotFound(id)
    }
    return toResponse(row, now)
  }

  async take(id: number, now: Date = new Date()): Promise<TicketResponse> {
    const row = await this.repository.take(id)
    return row === null ? this.rejectChange(id, 'take', 'queued tickets') : toResponse(row, now)
  }

  async close(id: number, resolution: string, now: Date = new Date()): Promise<TicketResponse> {
    const row = await this.repository.close(id, resolution)
    return row === null ? this.rejectChange(id, 'close', 'tickets in progress') : toResponse(row, now)
  }

  async escalate(id: number, now: Date = new Date()): Promise<TicketResponse> {
    const row = await this.repository.escalate(id)
    return row === null ? this.rejectChange(id, 'escalate', 'open tickets') : toResponse(row, now)
  }

  async getSummary(): Promise<SummaryResponse> {
    const counts = await this.repository.countOpen()
    const onTime = await this.analytics.overallOnTimeRate()
    return {
      openCount: counts.openCount,
      escalatedCount: counts.escalatedCount,
      closedCount: onTime.closedCount,
      onTimeCount: onTime.onTimeCount,
      onTimePercent: onTime.onTimePercent,
    }
  }

  // The change did not happen, so either there is no such ticket (404) or its status does not allow it (409).
  private async rejectChange(id: number, action: string, allowedFor: string): Promise<never> {
    const ticket = await this.repository.findById(id)
    if (ticket === null) {
      throw ticketNotFound(id)
    }
    throw new ConflictError(
      'INVALID_STATUS_CHANGE',
      `Cannot ${action} ticket ${id} with status "${ticket.status}": only ${allowedFor} can be changed this way`,
    )
  }
}

function ticketNotFound(id: number): NotFoundError {
  return new NotFoundError('TICKET_NOT_FOUND', `Ticket ${id} does not exist`)
}

function toResponse(row: TicketRow, now: Date): TicketResponse {
  return { ...row, minutesLeft: calculateMinutesLeft(row.slaDueAt, row.status, now) }
}
