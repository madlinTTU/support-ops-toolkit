import type { Ticket } from '@/api/types'
import { formatTimeLeft } from '@/lib/format'
import { getTimeLeftShare, getTimeRisk } from '@/lib/ticket-rules'
import type { TimeRisk } from '@/lib/ticket-rules'

const FILL: Record<TimeRisk, string> = {
  ok: 'bg-ok',
  at_risk: 'bg-risk',
  overdue: 'bg-late',
  none: '',
}

const TEXT: Record<TimeRisk, string> = {
  ok: 'text-ink',
  at_risk: 'text-risk font-medium',
  overdue: 'text-late font-medium',
  none: 'text-muted',
}

// A short bar shows how much of the SLA window is left: it empties as the deadline comes closer.
export function TimeLeft({ ticket }: { ticket: Ticket }) {
  const risk = getTimeRisk(ticket)
  if (risk === 'none') {
    return <span className="text-muted">-</span>
  }
  const share = risk === 'overdue' ? 1 : (getTimeLeftShare(ticket) ?? 0)

  return (
    <div className="flex items-center gap-3">
      <div aria-hidden className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-line">
        <div className={`h-full rounded-full ${FILL[risk]}`} style={{ width: `${Math.round(share * 100)}%` }} />
      </div>
      <span className={`whitespace-nowrap text-sm ${TEXT[risk]}`}>{formatTimeLeft(ticket.minutesLeft)}</span>
    </div>
  )
}
