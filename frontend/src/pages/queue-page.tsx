import { useState } from 'react'
import type { TicketFilters as Filters } from '@/api/types'
import { AsyncContent } from '@/components/AsyncContent'
import { SearchInput } from '@/components/SearchInput'
import { TicketDetail } from '@/components/TicketDetail'
import { TicketFilters } from '@/components/TicketFilters'
import { TicketTable } from '@/components/TicketTable'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useTickets } from '@/hooks/use-tickets'

const SEARCH_DELAY_MS = 300

export function QueuePage() {
  const [filters, setFilters] = useState<Filters>({ status: 'queued', category: 'all' })
  const [searchText, setSearchText] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const search = useDebouncedValue(searchText.trim(), SEARCH_DELAY_MS)
  const query = useTickets({ ...filters, search })

  const emptyMessage =
    search === ''
      ? 'No tickets match these filters. Try another status or category.'
      : `No tickets found for "${search}". Try another word or other filters.`

  return (
    <div className="flex gap-8">
      <section className="min-w-0 flex-1">
        <div className="mb-5 flex items-end justify-between gap-6">
          <h2 className="text-2xl font-semibold">Queue</h2>
          <div className="flex items-center gap-5">
            <SearchInput value={searchText} onChange={setSearchText} placeholder="Search subject or text" />
            <TicketFilters filters={filters} onChange={setFilters} />
          </div>
        </div>
        <AsyncContent
          isPending={query.isPending}
          error={query.error}
          isEmpty={query.data?.length === 0}
          emptyMessage={emptyMessage}
          onRetry={() => void query.refetch()}
        >
          {query.data !== undefined && (
            <TicketTable tickets={query.data} selectedId={selectedId} onSelect={setSelectedId} />
          )}
        </AsyncContent>
      </section>
      {selectedId !== null && (
        <TicketDetail key={selectedId} ticketId={selectedId} onDismiss={() => setSelectedId(null)} />
      )}
    </div>
  )
}
