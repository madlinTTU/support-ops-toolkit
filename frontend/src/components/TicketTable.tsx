import type { Ticket } from '@/api/types'
import { EscalatedTag, PriorityLabel, StatusLabel } from '@/components/Labels'
import { TimeLeft } from '@/components/TimeLeft'
import { humanize } from '@/lib/format'

interface TicketTableProps {
  tickets: Ticket[]
  selectedId: number | null
  onSelect: (id: number) => void
}

const HEADER = 'px-4 py-3 text-left text-sm font-medium text-muted'

// The coloured edge shows which row is selected (blue) or escalated (red).
function rowStyle(ticket: Ticket, selected: boolean): string {
  if (selected) {
    return 'bg-signal/5 shadow-[inset_3px_0_0_var(--color-signal)]'
  }
  return ticket.escalated ? 'bg-late/5 shadow-[inset_3px_0_0_var(--color-late)] hover:bg-late/10' : 'hover:bg-hover'
}

export function TicketTable({ tickets, selectedId, onSelect }: TicketTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-line">
          <tr>
            <th className={HEADER}>No.</th>
            <th className={HEADER}>Subject</th>
            <th className={HEADER}>Category</th>
            <th className={HEADER}>Priority</th>
            <th className={HEADER}>Time left</th>
            <th className={HEADER}>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              onClick={() => onSelect(ticket.id)}
              className={`cursor-pointer transition-colors ${rowStyle(ticket, ticket.id === selectedId)}`}
            >
              <td className="px-4 py-3 text-muted">{ticket.id}</td>
              <td className="px-4 py-3">
                <button type="button" onClick={() => onSelect(ticket.id)} className="text-left font-medium">
                  {ticket.subject}
                </button>
                {ticket.escalated && (
                  <span className="ml-2">
                    <EscalatedTag />
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-muted">{humanize(ticket.category)}</td>
              <td className="px-4 py-3">
                <PriorityLabel priority={ticket.priority} />
              </td>
              <td className="px-4 py-3">
                <TimeLeft ticket={ticket} />
              </td>
              <td className="px-4 py-3">
                <StatusLabel status={ticket.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
