import { useState } from 'react'
import { KB_CANDIDATE_STATUSES, TICKET_CATEGORIES } from '@/api/types'
import type { KbCandidateQuery } from '@/api/types'
import { AsyncContent } from '@/components/AsyncContent'
import { FilterSelect } from '@/components/FilterSelect'
import { KbCandidatesTable } from '@/components/KbCandidatesTable'
import { SearchInput } from '@/components/SearchInput'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useDecideKbCandidate, useKbCandidates } from '@/hooks/use-kb-candidates'
import { getErrorMessage } from '@/lib/api-error'

const SEARCH_DELAY_MS = 300

export function KbCandidatesPage() {
  const [filters, setFilters] = useState<Omit<KbCandidateQuery, 'search'>>({ category: 'all', status: 'all' })
  const [searchText, setSearchText] = useState('')
  const search = useDebouncedValue(searchText.trim(), SEARCH_DELAY_MS)
  const query = useKbCandidates({ ...filters, search })
  const decision = useDecideKbCandidate()

  const isFiltered = search !== '' || filters.category !== 'all' || filters.status !== 'all'
  const emptyMessage = isFiltered
    ? 'No recurring issues match the search and filters. Try another word or other filters.'
    : 'No recurring issues found yet. They appear when three or more closed tickets look alike.'

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold">Knowledge base</h2>
          <p className="mt-1 max-w-md text-muted">
            Issues that keep coming back. Accept the ones that deserve an article, dismiss the rest.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <SearchInput value={searchText} onChange={setSearchText} placeholder="Search subject or example text" />
          <FilterSelect
            label="Status"
            value={filters.status}
            options={KB_CANDIDATE_STATUSES}
            onChange={(status) => setFilters({ ...filters, status })}
          />
          <FilterSelect
            label="Category"
            value={filters.category}
            options={TICKET_CATEGORIES}
            onChange={(category) => setFilters({ ...filters, category })}
          />
        </div>
      </div>
      {decision.error !== null && (
        <p role="alert" className="mb-4 rounded-md bg-late/5 p-3 text-sm text-late">
          {getErrorMessage(decision.error)}
        </p>
      )}
      <AsyncContent
        isPending={query.isPending}
        error={query.error}
        isEmpty={query.data?.length === 0}
        emptyMessage={emptyMessage}
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
