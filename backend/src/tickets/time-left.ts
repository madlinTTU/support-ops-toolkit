import type { TicketStatus } from './ticket.types.js'

const MS_PER_MINUTE = 60_000

// Minutes until the deadline. Negative means the deadline has passed.
export function calculateMinutesLeft(dueAt: Date | null, status: TicketStatus, now: Date): number | null {
  if (dueAt === null || status === 'closed') {
    return null
  }
  return Math.round((dueAt.getTime() - now.getTime()) / MS_PER_MINUTE)
}
