import { DEFLECTION_RATE } from './report.config.js'

export interface ReportCandidate {
  category: string
  subject: string
  ticketCount: number
}

export interface ReportOnTime {
  closedCount: number
  onTimeCount: number
  onTimePercent: number
}

export interface DailyReportData {
  date: string
  receivedLast24h: number
  openCount: number
  escalatedCount: number
  onTime: ReportOnTime
  candidates: ReportCandidate[]
}

export function buildDailyReport(data: DailyReportData): string {
  const sections = [
    'Support daily report - ' + data.date,
    'Tickets received in the last 24 hours: ' + data.receivedLast24h,
    'Open tickets: ' + data.openCount + ' (' + data.escalatedCount + ' escalated)',
    onTimeSection(data.onTime),
    candidatesSection(data.candidates),
    estimateSection(data.candidates),
  ]
  return sections.join('\n\n') + '\n'
}

function onTimeSection(onTime: ReportOnTime): string {
  if (onTime.closedCount === 0) {
    return 'On-time rate for closed tickets: no closed tickets yet'
  }
  return (
    'On-time rate for closed tickets: ' +
    onTime.onTimePercent +
    '% (' +
    onTime.onTimeCount +
    ' of ' +
    onTime.closedCount +
    ' were closed within their SLA)'
  )
}

function candidatesSection(candidates: ReportCandidate[]): string {
  if (candidates.length === 0) {
    return 'Top knowledge-base candidates: none yet'
  }
  const lines = ['Top knowledge-base candidates (recurring issues):']
  for (const [index, candidate] of candidates.entries()) {
    lines.push(
      index + 1 + '. ' + candidate.subject + ' (' + candidate.category + ') - ' + candidate.ticketCount + ' tickets',
    )
  }
  return lines.join('\n')
}

function estimateSection(candidates: ReportCandidate[]): string {
  if (candidates.length === 0) {
    return 'Potential tickets avoided: no estimate, there are no candidates yet'
  }
  let candidateTickets = 0
  for (const candidate of candidates) {
    candidateTickets += candidate.ticketCount
  }
  const avoided = Math.round(candidateTickets * DEFLECTION_RATE)
  const percent = Math.round(DEFLECTION_RATE * 100)
  return (
    'Potential tickets avoided: ' +
    avoided +
    ' (simulated estimate)\n' +
    'Assumption: knowledge-base articles would prevent ' +
    percent +
    '% of the ' +
    candidateTickets +
    ' tickets listed above. This is an assumption, not a measurement.'
  )
}
