import { api } from '@/api/client'
import type { ResponseTimes, TicketsPerDay, TopRecurring, VolumeByCategory } from '@/api/types'

export async function fetchTicketsPerDay(): Promise<TicketsPerDay[]> {
  const response = await api.get<TicketsPerDay[]>('/stats/tickets-per-day')
  return response.data
}

export async function fetchVolumeByCategory(): Promise<VolumeByCategory[]> {
  const response = await api.get<VolumeByCategory[]>('/stats/volume-by-category')
  return response.data
}

export async function fetchResponseTimes(): Promise<ResponseTimes[]> {
  const response = await api.get<ResponseTimes[]>('/stats/response-times')
  return response.data
}

export async function fetchTopRecurring(): Promise<TopRecurring[]> {
  const response = await api.get<TopRecurring[]>('/stats/top-recurring')
  return response.data
}
