import type { TicketPriority } from '../tickets/ticket.types.js'
import { SLA_HOURS } from './sla.constants.js'

const HOUR_MS = 3_600_000

export function calculateDueAt(createdAt: Date, priority: TicketPriority): Date {
  return new Date(createdAt.getTime() + SLA_HOURS[priority] * HOUR_MS)
}
