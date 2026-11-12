import { generateTickets } from '../../src/demo/generator/generate-tickets.js'
import { triageTicket } from '../../src/triage/triage.js'

// The generator knows the correct answer for every ticket (expectedCategory, expectedPriority).
// Vague tickets are written to miss the keywords, so the accuracy is expected to stay below 100%.
describe('triageTicket accuracy on generated tickets', () => {
  const tickets = generateTickets({ count: 500, seed: 42, now: new Date('2026-01-01T00:00:00Z') })
  const results = tickets.map((ticket) => ({ ticket, result: triageTicket(ticket.subject, ticket.body) }))

  it('triageTicket_generatedTickets_categoryAccuracyIsAtLeast90Percent', () => {
    const correct = results.filter(({ ticket, result }) => result.category === ticket.expectedCategory).length

    expect(correct / tickets.length).toBeGreaterThanOrEqual(0.9)
  })

  it('triageTicket_generatedTickets_priorityAccuracyIsAtLeast80Percent', () => {
    const correct = results.filter(({ ticket, result }) => result.priority === ticket.expectedPriority).length

    expect(correct / tickets.length).toBeGreaterThanOrEqual(0.8)
  })
})
