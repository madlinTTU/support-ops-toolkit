import type { KbCandidateStatus, TicketPriority, TicketStatus } from '@/api/types'
import { humanize } from '@/lib/format'

const PRIORITY_DOT: Record<TicketPriority, string> = {
  critical: 'bg-late',
  high: 'bg-risk',
  normal: 'bg-signal',
  low: 'bg-muted/50',
}

const STATUS_DOT: Record<TicketStatus | KbCandidateStatus, string> = {
  new: 'bg-muted/50',
  queued: 'bg-signal',
  in_progress: 'bg-violet-600',
  closed: 'bg-ok',
  proposed: 'bg-signal',
  accepted: 'bg-ok',
  dismissed: 'bg-muted/50',
}

function DotLabel({ dot, text }: { dot: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span aria-hidden className={`size-2 rounded-full ${dot}`} />
      {text}
    </span>
  )
}

export function PriorityLabel({ priority }: { priority: TicketPriority | null }) {
  if (priority === null) {
    return <span className="text-muted">-</span>
  }
  return <DotLabel dot={PRIORITY_DOT[priority]} text={humanize(priority)} />
}

export function StatusLabel({ status }: { status: TicketStatus | KbCandidateStatus }) {
  return <DotLabel dot={STATUS_DOT[status]} text={humanize(status)} />
}

export function EscalatedTag() {
  return <span className="rounded bg-late px-1.5 py-0.5 text-xs font-medium text-white">Escalated</span>
}
