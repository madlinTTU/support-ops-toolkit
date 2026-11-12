import { useQuery } from '@tanstack/react-query'
import { fetchResponseTimes, fetchTicketsPerDay, fetchTopRecurring, fetchVolumeByCategory } from '@/api/stats'

export function useTicketsPerDay() {
  return useQuery({ queryKey: ['stats', 'tickets-per-day'], queryFn: fetchTicketsPerDay })
}

export function useVolumeByCategory() {
  return useQuery({ queryKey: ['stats', 'volume-by-category'], queryFn: fetchVolumeByCategory })
}

export function useResponseTimes() {
  return useQuery({ queryKey: ['stats', 'response-times'], queryFn: fetchResponseTimes })
}

export function useTopRecurring() {
  return useQuery({ queryKey: ['stats', 'top-recurring'], queryFn: fetchTopRecurring })
}
