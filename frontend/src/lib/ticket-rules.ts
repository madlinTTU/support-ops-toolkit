import type { Ticket } from '@/api/types'

// These rules repeat the ones of the backend, only to decide which buttons to show. The backend still checks them.
export function canTake(ticket: Ticket): boolean {
  return ticket.status === 'queued'
}

export function canClose(ticket: Ticket): boolean {
  return ticket.status === 'in_progress'
}

export function canEscalate(ticket: Ticket): boolean {
  return ticket.status !== 'closed' && !ticket.escalated
}

export function isOverdue(ticket: Ticket): boolean {
  return ticket.minutesLeft !== null && ticket.minutesLeft < 0
}

export type TimeRisk = 'ok' | 'at_risk' | 'overdue' | 'none'

// Same threshold as the backend: a ticket is at risk when less than a quarter of its SLA window is left.
const AT_RISK_SHARE = 0.25
const MS_PER_MINUTE = 60_000

// Share of the whole SLA window that is still left, from 0 to 1. Null when there is no deadline to count down to.
export function getTimeLeftShare(ticket: Ticket): number | null {
  if (ticket.minutesLeft === null || ticket.slaDueAt === null) {
    return null
  }
  const windowMinutes = (Date.parse(ticket.slaDueAt) - Date.parse(ticket.createdAt)) / MS_PER_MINUTE
  if (windowMinutes <= 0) {
    return 0
  }
  return Math.min(1, Math.max(0, ticket.minutesLeft / windowMinutes))
}

export function getTimeRisk(ticket: Ticket): TimeRisk {
  const share = getTimeLeftShare(ticket)
  if (share === null) {
    return 'none'
  }
  if (isOverdue(ticket)) {
    return 'overdue'
  }
  return share < AT_RISK_SHARE ? 'at_risk' : 'ok'
}
