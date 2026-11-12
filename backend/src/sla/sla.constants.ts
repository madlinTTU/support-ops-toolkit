import type { TicketPriority } from '../tickets/ticket.types.js'

export const SLA_HOURS: Record<TicketPriority, number> = {
  critical: 4,
  high: 8,
  normal: 24,
  low: 72,
}
