import { useState } from 'react'
import type { TicketFilters as Filters } from '@/api/types'
import { AsyncContent } from '@/components/AsyncContent'
import { TicketDetail } from '@/components/TicketDetail'
import { TicketFilters } from '@/components/TicketFilters'
import { TicketTable } from '@/components/TicketTable'
import { useTickets } from '@/hooks/use-tickets'

export function QueuePage() {
  const [filters, setFilters] = useState<Filters>({ status: 'queued', category: 'all' })
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const query = useTickets(filters)

  return (
    <div className="flex gap-8">
      <section className="min-w-0 flex-1">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Queue</h2>
          <TicketFilters filters={filters} onChange={setFilters} />
        </div>
        <AsyncContent
          isPending={query.isPending}
          error={query.error}
          isEmpty={query.data?.length === 0}
          emptyMessage="No tickets match these filters. Try another status or category."
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
