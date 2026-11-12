import { AsyncContent } from '@/components/AsyncContent'
import { KbCandidatesTable } from '@/components/KbCandidatesTable'
import { useDecideKbCandidate, useKbCandidates } from '@/hooks/use-kb-candidates'
import { getErrorMessage } from '@/lib/api-error'

export function KbCandidatesPage() {
  const query = useKbCandidates()
  const decision = useDecideKbCandidate()

  return (
    <section>
      <h2 className="text-2xl font-semibold">Knowledge base</h2>
      <p className="mb-5 mt-1 max-w-xl text-muted">
        Issues that keep coming back. Accept the ones that deserve an article, dismiss the rest.
      </p>
      {decision.error !== null && (
        <p role="alert" className="mb-4 rounded-md bg-late/5 p-3 text-sm text-late">
          {getErrorMessage(decision.error)}
        </p>
      )}
      <AsyncContent
        isPending={query.isPending}
        error={query.error}
        isEmpty={query.data?.length === 0}
        emptyMessage="No recurring issues found yet. They appear when three or more closed tickets look alike."
        onRetry={() => void query.refetch()}
      >
        {query.data !== undefined && (
          <KbCandidatesTable
            candidates={query.data}
            isPending={decision.isPending}
            onDecide={(id, status) => decision.mutate({ id, status })}
          />
        )}
      </AsyncContent>
    </section>
  )
}
