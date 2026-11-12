import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchTickets } from '@/api/tickets'
import type { TicketQuery } from '@/api/types'

// The previous list stays on the screen while the new one loads, so typing in the search field does not flicker.
export function useTickets(query: TicketQuery) {
  return useQuery({
    queryKey: ['tickets', query],
    queryFn: () => fetchTickets(query),
    placeholderData: keepPreviousData,
  })
}
