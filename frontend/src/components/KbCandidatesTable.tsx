import type { KbCandidate, KbDecision } from '@/api/types'
import { StatusLabel } from '@/components/Labels'
import { formatDateTime, humanize } from '@/lib/format'
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from '@/lib/styles'

interface KbCandidatesTableProps {
  candidates: KbCandidate[]
  isPending: boolean
  onDecide: (id: number, status: KbDecision) => void
}

const HEADER = 'px-4 py-3 text-left text-sm font-medium text-muted'

export function KbCandidatesTable({ candidates, isPending, onDecide }: KbCandidatesTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-line">
          <tr>
            <th className={HEADER}>Recurring issue</th>
            <th className={HEADER}>Category</th>
            <th className={HEADER}>Tickets</th>
            <th className={HEADER}>Last seen</th>
            <th className={HEADER}>Status</th>
            <th className={HEADER}>Decision</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {candidates.map((candidate) => (
            <tr key={candidate.id} className="hover:bg-hover">
              <td className="max-w-md px-4 py-3">
                <div className="font-medium">{candidate.subject}</div>
                {candidate.exampleText !== '' && (
                  <p className="mt-1 line-clamp-2 text-muted" title={candidate.exampleText}>
                    {candidate.exampleText}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 text-muted">{humanize(candidate.category)}</td>
              <td className="px-4 py-3 font-medium">{candidate.ticketCount}</td>
              <td className="px-4 py-3 text-muted">{formatDateTime(candidate.lastSeenAt)}</td>
              <td className="px-4 py-3">
                <StatusLabel status={candidate.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  {candidate.status !== 'accepted' && (
                    <button
                      type="button"
                      className={BUTTON_PRIMARY}
                      disabled={isPending}
                      onClick={() => onDecide(candidate.id, 'accepted')}
                    >
                      Accept
                    </button>
                  )}
                  {candidate.status !== 'dismissed' && (
                    <button
                      type="button"
                      className={BUTTON_SECONDARY}
                      disabled={isPending}
                      onClick={() => onDecide(candidate.id, 'dismissed')}
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
