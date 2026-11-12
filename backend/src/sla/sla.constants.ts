import type { TicketPriority } from '../tickets/ticket.types.js'

export const SLA_HOURS: Record<TicketPriority, number> = {
  critical: 4,
  high: 8,
  normal: 24,
  low: 72,
}

// A ticket is "at risk" when less than this share of its time window is left.
export const AT_RISK_SHARE = 0.25
