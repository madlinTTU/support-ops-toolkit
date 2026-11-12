import { useQuery } from '@tanstack/react-query'
import { fetchTicket } from '@/api/tickets'

export function useTicket(id: number) {
  return useQuery({ queryKey: ['ticket', id], queryFn: () => fetchTicket(id) })
}
