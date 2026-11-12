import { buildDailyReport } from '../../src/reports/report.js'
import type { DailyReportData } from '../../src/reports/report.js'

const fullData: DailyReportData = {
  date: '2026-06-30',
  receivedLast24h: 18,
  openCount: 45,
  escalatedCount: 7,
  onTime: { closedCount: 200, onTimeCount: 165, onTimePercent: 82.5 },
  candidates: [
    { category: 'account_access', subject: 'Cannot reset password', ticketCount: 34 },
    { category: 'billing', subject: 'Invoice shows wrong amount', ticketCount: 20 },
    { category: 'bug', subject: 'Export to CSV fails', ticketCount: 11 },
  ],
}

describe('buildDailyReport', () => {
  it('buildDailyReport_fullData_returnsExpectedText', () => {
    expect(buildDailyReport(fullData)).toBe(
      [
        'Support daily report - 2026-06-30',
        '',
        'Tickets received in the last 24 hours: 18',
        '',
        'Open tickets: 45 (7 escalated)',
        '',
        'On-time rate for closed tickets: 82.5% (165 of 200 were closed within their SLA)',
        '',
        'Top knowledge-base candidates (recurring issues):',
        '1. Cannot reset password (account_access) - 34 tickets',
        '2. Invoice shows wrong amount (billing) - 20 tickets',
        '3. Export to CSV fails (bug) - 11 tickets',
        '',
        'Potential tickets avoided: 26 (simulated estimate)',
        'Assumption: knowledge-base articles would prevent 40% of the 65 tickets listed above. ' +
          'This is an assumption, not a measurement.',
        '',
      ].join('\n'),
    )
  })

  it('buildDailyReport_anyData_showsSimulatedLabelAndAssumptionNextToEstimate', () => {
    const report = buildDailyReport(fullData)

    expect(report).toContain('Potential tickets avoided: 26 (simulated estimate)\nAssumption: ')
    expect(report).toContain('40%')
  })

  it('buildDailyReport_noCandidates_saysThereIsNoEstimate', () => {
    const report = buildDailyReport({ ...fullData, candidates: [] })

    expect(report).toContain('Top knowledge-base candidates: none yet')
    expect(report).toContain('Potential tickets avoided: no estimate, there are no candidates yet')
    expect(report).not.toContain('simulated estimate')
  })

  it('buildDailyReport_noClosedTickets_saysThereAreNoClosedTickets', () => {
    const report = buildDailyReport({
      ...fullData,
      onTime: { closedCount: 0, onTimeCount: 0, onTimePercent: 0 },
    })

    expect(report).toContain('On-time rate for closed tickets: no closed tickets yet')
    expect(report).not.toContain('NaN')
  })

  it('buildDailyReport_estimateWithOddNumbers_roundsToWholeTickets', () => {
    const report = buildDailyReport({
      ...fullData,
      candidates: [{ category: 'bug', subject: 'Export to CSV fails', ticketCount: 3 }],
    })

    expect(report).toContain('Potential tickets avoided: 1 (simulated estimate)')
  })
})
