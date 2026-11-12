import { calculateMinutesLeft } from '../../src/tickets/time-left.js'

const now = new Date('2026-06-30T12:00:00Z')

describe('calculateMinutesLeft', () => {
  it('calculateMinutesLeft_deadlineInTwoHours_returns120', () => {
    expect(calculateMinutesLeft(new Date('2026-06-30T14:00:00Z'), 'in_progress', now)).toBe(120)
  })

  it('calculateMinutesLeft_deadlinePassed_returnsNegative', () => {
    expect(calculateMinutesLeft(new Date('2026-06-30T11:30:00Z'), 'queued', now)).toBe(-30)
  })

  it('calculateMinutesLeft_secondsLeft_roundsToWholeMinutes', () => {
    expect(calculateMinutesLeft(new Date('2026-06-30T12:10:40Z'), 'queued', now)).toBe(11)
  })

  it('calculateMinutesLeft_noDeadline_returnsNull', () => {
    expect(calculateMinutesLeft(null, 'new', now)).toBeNull()
  })

  it('calculateMinutesLeft_closedTicket_returnsNull', () => {
    expect(calculateMinutesLeft(new Date('2026-06-30T14:00:00Z'), 'closed', now)).toBeNull()
  })
})
