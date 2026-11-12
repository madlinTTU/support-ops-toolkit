import { calculateDueAt } from '../../src/sla/sla.js'

const HOUR_MS = 3_600_000
const createdAt = new Date('2026-01-01T00:00:00Z')

describe('calculateDueAt', () => {
  it.each([
    ['critical', 4],
    ['high', 8],
    ['normal', 24],
    ['low', 72],
  ] as const)('calculateDueAt_%sPriority_addsSlaHours', (priority, hours) => {
    const dueAt = calculateDueAt(createdAt, priority)

    expect(dueAt.getTime() - createdAt.getTime()).toBe(hours * HOUR_MS)
  })
})
