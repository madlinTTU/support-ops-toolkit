import { generateTickets } from '../../src/demo/generator/generate-tickets.js'
import { SLA_HOURS } from '../../src/sla/sla.constants.js'

const HOUR_MS = 3_600_000
const now = new Date('2026-06-30T12:00:00Z')

describe('generateTickets resolution times', () => {
  const tickets = generateTickets({ count: 500, seed: 42, now })
  const closed = tickets.filter((ticket) => ticket.status === 'closed')

  function isOnTime(ticket: (typeof tickets)[number]): boolean {
    const dueAt = ticket.createdAt.getTime() + SLA_HOURS[ticket.expectedPriority] * HOUR_MS
    return (ticket.closedAt?.getTime() ?? Infinity) <= dueAt
  }

  it('generateTickets_closedTickets_mostAreOnTimeAndSomeAreLate', () => {
    const onTimeShare = closed.filter(isOnTime).length / closed.length

    expect(onTimeShare).toBeGreaterThanOrEqual(0.7)
    expect(onTimeShare).toBeLessThanOrEqual(0.9)
  })

  it('generateTickets_closedTickets_firstResponseComesBeforeClosing', () => {
    for (const ticket of closed) {
      expect(ticket.firstResponseAt).not.toBeNull()
      expect(ticket.firstResponseAt?.getTime()).toBeLessThan(ticket.closedAt?.getTime() ?? 0)
    }
  })

  it('generateTickets_openTickets_stillExist', () => {
    expect(tickets.length - closed.length).toBeGreaterThan(0)
  })

  it('generateTickets_sameSeed_producesTheSameTickets', () => {
    expect(generateTickets({ count: 500, seed: 42, now })).toEqual(tickets)
  })
})
