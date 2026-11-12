import { Inject, Injectable } from '@nestjs/common'
import pg from 'pg'
import { PG_POOL } from '../database/database.module.js'
import type { TicketCategory, TicketChannel, TicketPriority, TicketStatus } from './ticket.types.js'

export interface TicketRow {
  id: number
  subject: string
  body: string
  customerEmail: string
  channel: TicketChannel
  category: TicketCategory | null
  priority: TicketPriority | null
  tags: string[]
  status: TicketStatus
  escalated: boolean
  createdAt: Date
  triagedAt: Date | null
  slaDueAt: Date | null
  firstResponseAt: Date | null
  closedAt: Date | null
  escalatedAt: Date | null
  resolution: string | null
}

export interface TicketFilter {
  status: TicketStatus | null
  category: TicketCategory | null
  escalated: boolean | null
}

export interface OpenCounts {
  openCount: number
  escalatedCount: number
}

const TICKET_COLUMNS = `
  id, subject, body, customer_email AS "customerEmail", channel, category, priority, tags, status, escalated,
  created_at AS "createdAt", triaged_at AS "triagedAt", sla_due_at AS "slaDueAt",
  first_response_at AS "firstResponseAt", closed_at AS "closedAt", escalated_at AS "escalatedAt", resolution
`

// $1 status, $2 category, $3 escalated.
const SELECT_TICKETS = `
  SELECT ${TICKET_COLUMNS}
  FROM tickets
  WHERE ($1::text IS NULL OR status = $1)
    AND ($2::text IS NULL OR category = $2)
    AND ($3::boolean IS NULL OR escalated = $3)
  ORDER BY array_position(ARRAY['critical', 'high', 'normal', 'low'], priority), sla_due_at, id
`

const SELECT_TICKET = `SELECT ${TICKET_COLUMNS} FROM tickets WHERE id = $1::bigint`

// The status in WHERE makes the check and the change one atomic step: two agents cannot take the same ticket.
// No row returned means: the ticket does not exist or its status does not allow the change.
const TAKE_TICKET = `
  UPDATE tickets
  SET status = 'in_progress', first_response_at = COALESCE(first_response_at, now())
  WHERE id = $1::bigint AND status = 'queued'
  RETURNING ${TICKET_COLUMNS}
`

// $2 resolution
const CLOSE_TICKET = `
  UPDATE tickets
  SET status = 'closed', closed_at = now(), resolution = $2
  WHERE id = $1::bigint AND status = 'in_progress'
  RETURNING ${TICKET_COLUMNS}
`

const ESCALATE_TICKET = `
  UPDATE tickets
  SET escalated = true, escalated_at = COALESCE(escalated_at, now())
  WHERE id = $1::bigint AND status <> 'closed'
  RETURNING ${TICKET_COLUMNS}
`

const COUNT_OPEN = `
  SELECT count(*) FILTER (WHERE status <> 'closed')::int AS "openCount",
         count(*) FILTER (WHERE status <> 'closed' AND escalated)::int AS "escalatedCount"
  FROM tickets
`

@Injectable()
export class TicketsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  async findAll(filter: TicketFilter): Promise<TicketRow[]> {
    const result = await this.pool.query<TicketRow>(SELECT_TICKETS, [filter.status, filter.category, filter.escalated])
    return result.rows
  }

  async findById(id: number): Promise<TicketRow | null> {
    const result = await this.pool.query<TicketRow>(SELECT_TICKET, [id])
    return result.rows[0] ?? null
  }

  async take(id: number): Promise<TicketRow | null> {
    const result = await this.pool.query<TicketRow>(TAKE_TICKET, [id])
    return result.rows[0] ?? null
  }

  async close(id: number, resolution: string): Promise<TicketRow | null> {
    const result = await this.pool.query<TicketRow>(CLOSE_TICKET, [id, resolution])
    return result.rows[0] ?? null
  }

  async escalate(id: number): Promise<TicketRow | null> {
    const result = await this.pool.query<TicketRow>(ESCALATE_TICKET, [id])
    return result.rows[0] ?? null
  }

  async countOpen(): Promise<OpenCounts> {
    const result = await this.pool.query<OpenCounts>(COUNT_OPEN)
    return result.rows[0]
  }
}
