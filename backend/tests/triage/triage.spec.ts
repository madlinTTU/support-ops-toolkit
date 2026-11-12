import { triageTicket } from '../../src/triage/triage.js'

describe('triageTicket category', () => {
  it.each([
    ['account_access', 'Cannot reset my password', 'The reset link never arrives.'],
    ['billing', 'Cannot download invoice', 'I need the invoice for accounting.'],
    ['data_change', 'Update account email', 'Please change email address on my profile.'],
    ['bug', 'Export button shows an error', 'The page crashes when I click it.'],
    ['how_to', 'How do I invite a team member?', 'Is there a guide for this?'],
    ['other', 'Typo on the pricing page', 'The second plan has a spelling mistake.'],
  ])('triageTicket_typicalTicket_returns%s', (expected, subject, body) => {
    expect(triageTicket(subject, body).category).toBe(expected)
  })

  it('triageTicket_noKnownWords_returnsOtherAndNormal', () => {
    const result = triageTicket('Hello', 'Just saying hi.')

    expect(result).toEqual({ category: 'other', priority: 'normal', tags: [] })
  })

  it('triageTicket_upperCaseText_stillMatches', () => {
    expect(triageTicket('PASSWORD PROBLEM', 'RESET LINK BROKEN').category).toBe('account_access')
  })

  it('triageTicket_keywordInSubject_countsDouble', () => {
    // billing: "invoice" in the subject = 2. account_access: "password" in the body = 1.
    const result = triageTicket('Invoice question', 'It mentions my password.')

    expect(result.category).toBe('billing')
  })

  it('triageTicket_tie_firstCategoryInOrderWins', () => {
    // One body match each: "password" (account_access) and "invoice" (billing).
    const result = triageTicket('Hello', 'password invoice')

    expect(result.category).toBe('account_access')
  })

  it('triageTicket_repeatedKeyword_tagsHaveNoDuplicates', () => {
    const result = triageTicket('Invoice', 'invoice invoice and the invoice again')

    expect(result.tags).toEqual(['invoice'])
  })
})

describe('triageTicket priority', () => {
  it('triageTicket_criticalWord_returnsCritical', () => {
    expect(triageTicket('Charged twice', 'Please fix it.').priority).toBe('critical')
  })

  it('triageTicket_urgentWord_returnsHigh', () => {
    expect(triageTicket('Help', 'I need this asap.').priority).toBe('high')
  })

  it('triageTicket_criticalAndUrgentWords_criticalWins', () => {
    expect(triageTicket('Account hacked', 'It is urgent, I am locked out.').priority).toBe('critical')
  })

  it('triageTicket_howToWithoutUrgentWords_returnsLow', () => {
    expect(triageTicket('How to add a user', 'Where can I find it?').priority).toBe('low')
  })

  it('triageTicket_howToButUrgent_returnsHigh', () => {
    expect(triageTicket('How to add a user', 'Urgent, my boss is waiting.').priority).toBe('high')
  })

  it('triageTicket_ordinaryTicket_returnsNormal', () => {
    expect(triageTicket('Cannot download invoice', 'Need it for accounting.').priority).toBe('normal')
  })
})
