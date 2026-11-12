import { useQuery } from '@tanstack/react-query'
import { fetchSummary } from '@/api/tickets'

export function useSummary() {
  return useQuery({ queryKey: ['summary'], queryFn: fetchSummary })
}
