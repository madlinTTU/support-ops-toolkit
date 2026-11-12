import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchResponseTimes, fetchTicketsPerDay, fetchTopRecurring, fetchVolumeByCategory } from '@/api/stats'

// When the data is loaded again, the old chart stays on the screen until the new one arrives.
export function useTicketsPerDay() {
  return useQuery({
    queryKey: ['stats', 'tickets-per-day'],
    queryFn: fetchTicketsPerDay,
    placeholderData: keepPreviousData,
  })
}

export function useVolumeByCategory() {
  return useQuery({
    queryKey: ['stats', 'volume-by-category'],
    queryFn: fetchVolumeByCategory,
    placeholderData: keepPreviousData,
  })
}

export function useResponseTimes() {
  return useQuery({
    queryKey: ['stats', 'response-times'],
    queryFn: fetchResponseTimes,
    placeholderData: keepPreviousData,
  })
}

export function useTopRecurring() {
  return useQuery({
    queryKey: ['stats', 'top-recurring'],
    queryFn: fetchTopRecurring,
    placeholderData: keepPreviousData,
  })
}
