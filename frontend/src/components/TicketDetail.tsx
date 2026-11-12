import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Ticket } from '@/api/types'
import { AsyncContent } from '@/components/AsyncContent'
import { CloseTicketForm } from '@/components/CloseTicketForm'
import { EscalatedTag, PriorityLabel, StatusLabel } from '@/components/Labels'
import { TimeLeft } from '@/components/TimeLeft'
import { useTicket } from '@/hooks/use-ticket'
import { useTicketActions } from '@/hooks/use-ticket-actions'
import { getErrorMessage } from '@/lib/api-error'
import { formatDateTime, humanize } from '@/lib/format'
import { BUTTON_DANGER, BUTTON_PRIMARY } from '@/lib/styles'
import { canClose, canEscalate, canTake } from '@/lib/ticket-rules'

interface TicketDetailProps {
  ticketId: number
  onDismiss: () => void
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-0.5 break-words">{children}</dd>
    </div>
  )
}

function TicketActions({ ticket }: { ticket: Ticket }) {
  const actions = useTicketActions(ticket.id)
  const [closing, setClosing] = useState(false)

  return (
    <div className="mt-6 border-t border-line pt-5">
      <div className="flex gap-2">
        {canTake(ticket) && (
          <button type="button" className={BUTTON_PRIMARY} disabled={actions.isPending} onClick={actions.take}>
            Take
          </button>
        )}
        {canClose(ticket) && !closing && (
          <button
            type="button"
            className={BUTTON_PRIMARY}
            disabled={actions.isPending}
            onClick={() => setClosing(true)}
          >
            Close
          </button>
        )}
        {canEscalate(ticket) && (
          <button type="button" className={BUTTON_DANGER} disabled={actions.isPending} onClick={actions.escalate}>
            Escalate
          </button>
        )}
        {!canTake(ticket) && !canClose(ticket) && !canEscalate(ticket) && (
          <p className="text-sm text-muted">Nothing to do here, this ticket is done.</p>
        )}
      </div>
      {closing && canClose(ticket) && (
        <CloseTicketForm
          isPending={actions.isPending}
          onSubmit={(resolution) => actions.close(resolution, () => setClosing(false))}
          onCancel={() => setClosing(false)}
        />
      )}
      {actions.error !== null && (
        <p role="alert" className="mt-4 rounded-md bg-late/5 p-3 text-sm text-late">
          {getErrorMessage(actions.error)}
        </p>
      )}
    </div>
  )
}

function TicketContent({ ticket }: { ticket: Ticket }) {
  return (
    <>
      <h2 className="text-lg font-semibold leading-snug">{ticket.subject}</h2>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <StatusLabel status={ticket.status} />
        <PriorityLabel priority={ticket.priority} />
        {ticket.escalated && <EscalatedTag />}
      </div>
      <div className="mt-4">
        <TimeLeft ticket={ticket} />
      </div>
      <p className="mt-5 whitespace-pre-wrap border-l-2 border-line pl-4 leading-relaxed">{ticket.body}</p>
      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
        <Field label="Customer">{ticket.customerEmail}</Field>
        <Field label="Channel">{humanize(ticket.channel)}</Field>
        <Field label="Category">{humanize(ticket.category)}</Field>
        <Field label="Tags">{ticket.tags.length > 0 ? ticket.tags.join(', ') : '-'}</Field>
        <Field label="Created">{formatDateTime(ticket.createdAt)}</Field>
        <Field label="Deadline">{formatDateTime(ticket.slaDueAt)}</Field>
        <Field label="First response">{formatDateTime(ticket.firstResponseAt)}</Field>
        <Field label="Closed">{formatDateTime(ticket.closedAt)}</Field>
      </dl>
      {ticket.resolution !== null && (
        <div className="mt-6 rounded-md bg-ok/10 p-3 text-sm">
          <div className="font-medium text-ok">Resolution</div>
          <p className="mt-1 whitespace-pre-wrap">{ticket.resolution}</p>
        </div>
      )}
      <TicketActions ticket={ticket} />
    </>
  )
}

export function TicketDetail({ ticketId, onDismiss }: TicketDetailProps) {
  const query = useTicket(ticketId)

  return (
    <aside className="sticky top-8 max-h-[calc(100vh-4rem)] w-[26rem] shrink-0 self-start overflow-y-auto rounded-lg border border-line bg-surface p-6">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted">Ticket {ticketId}</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close the ticket view"
          className="rounded px-2 text-xl leading-none text-muted hover:text-ink"
        >
          ×
        </button>
      </div>
      <AsyncContent
        isPending={query.isPending}
        error={query.error}
        isEmpty={false}
        emptyMessage=""
        onRetry={() => void query.refetch()}
      >
        {query.data !== undefined && <TicketContent ticket={query.data} />}
      </AsyncContent>
    </aside>
  )
}
