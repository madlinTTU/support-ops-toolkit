import { generateTickets } from '../../scripts/generator/generate-tickets.js'
import { RECURRING_TEMPLATES } from '../../scripts/generator/issue-templates.js'
import { findRecurringGroups } from '../../src/knowledge-base/recurring.js'
import type { ClosedTicket } from '../../src/knowledge-base/recurring.js'
import { triageTicket } from '../../src/triage/triage.js'

let nextId = 1

function ticket(category: string, subject: string, body = ''): ClosedTicket {
  const id = nextId++
  return { id, category, subject, body, createdAt: new Date(2026, 0, id), kbCandidateId: null }
}

const passwordTickets = (category: string, count: number) =>
  Array.from({ length: count }, (_, i) =>
    ticket(category, 'Password reset email not arriving', 'I asked for a password reset but nothing came. Try ' + i),
  )

describe('findRecurringGroups', () => {
  it('findRecurringGroups_fourTicketsAboutSameProblem_returnsOneGroup', () => {
    const groups = findRecurringGroups(passwordTickets('account_access', 4))

    expect(groups).toHaveLength(1)
    expect(groups[0].tickets).toHaveLength(4)
    expect(groups[0].category).toBe('account_access')
  })

  it('findRecurringGroups_twoSimilarTickets_returnsNoGroup', () => {
    expect(findRecurringGroups(passwordTickets('account_access', 2))).toEqual([])
  })

  it('findRecurringGroups_similarTicketsInDifferentCategories_areNotGrouped', () => {
    // Together they would be 4 tickets, but each category has only 2.
    const tickets = [...passwordTickets('account_access', 2), ...passwordTickets('billing', 2)]

    expect(findRecurringGroups(tickets)).toEqual([])
  })

  it('findRecurringGroups_threeSimilarTicketsInTwoCategories_returnsOneGroupPerCategory', () => {
    const tickets = [...passwordTickets('account_access', 3), ...passwordTickets('billing', 3)]

    expect(findRecurringGroups(tickets).map((group) => group.category)).toEqual(['account_access', 'billing'])
  })

  it('findRecurringGroups_twoDifferentProblemsInOneCategory_returnsTwoGroups', () => {
    const invoiceTickets = Array.from({ length: 3 }, () =>
      ticket('account_access', 'Download invoice button gives empty file', 'Accounting needs the PDF copy'),
    )

    const groups = findRecurringGroups([...passwordTickets('account_access', 3), ...invoiceTickets])

    expect(groups).toHaveLength(2)
  })

  it('findRecurringGroups_unrelatedTicket_isNotAddedToGroup', () => {
    const odd = ticket('account_access', 'Typo on pricing page', 'Second plan says unlimted')

    const groups = findRecurringGroups([...passwordTickets('account_access', 3), odd])

    expect(groups[0].tickets).toHaveLength(3)
  })

  it('findRecurringGroups_group_usesMostTypicalSubject', () => {
    // The middle ticket shares most words with the two others.
    const tickets = [
      ticket('bug', 'password reset email'),
      ticket('bug', 'password reset email link'),
      ticket('bug', 'password reset email link spam'),
    ]

    expect(findRecurringGroups(tickets)[0].representativeSubject).toBe('password reset email link')
  })

  it('findRecurringGroups_group_usesBodyOfTheSameTicketAsTheSubject', () => {
    const tickets = [
      ticket('bug', 'password reset email', 'first text'),
      ticket('bug', 'password reset email link', 'middle text'),
      ticket('bug', 'password reset email link spam', 'last text'),
    ]

    const group = findRecurringGroups(tickets)[0]

    expect(group.representativeSubject).toBe('password reset email link')
    expect(group.representativeBody).toBe('middle text')
  })

  it('findRecurringGroups_sameProblemInDifferentWords_returnsOneGroup', () => {
    const subject = 'Password reset email not arriving'
    const forgot = 'I forgot my password and the reset email does not show up in my inbox.'
    const requested = 'I requested a password reset but the email never arrives in my inbox.'
    // Two tickets per wording: each wording alone is too small, together they are one problem.
    const tickets = [
      ticket('account_access', subject, forgot),
      ticket('account_access', subject, forgot),
      ticket('account_access', subject, requested),
      ticket('account_access', subject, requested),
    ]

    const groups = findRecurringGroups(tickets)

    expect(groups).toHaveLength(1)
    expect(groups[0].tickets).toHaveLength(4)
  })
})

describe('findRecurringGroups on generated tickets', () => {
  // Same flow as in production: closed tickets, the category comes from triage.
  const generated = generateTickets({ count: 500, seed: 42, now: new Date('2026-01-01T00:00:00Z') })
    .filter((item) => item.status === 'closed')
    .map((item, index) => ({
      issueType: item.issueType,
      ticket: {
        id: index,
        category: triageTicket(item.subject, item.body).category,
        subject: item.subject,
        body: item.body,
        createdAt: item.createdAt,
        kbCandidateId: null,
      },
    }))
  const issueTypeById = new Map(generated.map(({ issueType, ticket }) => [ticket.id, issueType]))
  const groups = findRecurringGroups(generated.map(({ ticket }) => ticket))
  const typesInGroups = new Set(groups.flatMap((group) => group.tickets.map((t) => issueTypeById.get(t.id))))

  it('findRecurringGroups_generatedTickets_everyRecurringProblemBecomesCandidate', () => {
    for (const template of RECURRING_TEMPLATES) {
      expect(typesInGroups).toContain(template.id)
    }
  })

  it('findRecurringGroups_generatedTickets_differentProblemsAreNeverInOneGroup', () => {
    for (const group of groups) {
      const types = new Set(group.tickets.map((t) => issueTypeById.get(t.id)))
      expect(types.size).toBe(1)
    }
  })

  it('findRecurringGroups_generatedTickets_aProblemIsRarelySplitIntoSeveralGroups', () => {
    // Without splitting there is one group per problem. Some splitting is accepted, a problem written in
    // very different words can stay apart.
    expect(groups.length).toBeLessThanOrEqual(RECURRING_TEMPLATES.length * 1.5)
  })

  it('findRecurringGroups_generatedTickets_oneOffProblemsDoNotBecomeCandidates', () => {
    const oneOffTypes = [...typesInGroups].filter((type) => type?.startsWith('one-off'))

    expect(oneOffTypes).toEqual([])
  })
})
