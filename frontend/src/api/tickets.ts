import { api } from '@/api/client'
import type { Summary, Ticket, TicketQuery } from '@/api/types'

export async function fetchTickets(query: TicketQuery): Promise<Ticket[]> {
  const params: Record<string, string> = {}
  if (query.status !== 'all') {
    params.status = query.status
  }
  if (query.category !== 'all') {
    params.category = query.category
  }
  if (query.search !== '') {
    params.search = query.search
  }
  const response = await api.get<Ticket[]>('/tickets', { params })
  return response.data
}

export async function fetchTicket(id: number): Promise<Ticket> {
  const response = await api.get<Ticket>(`/tickets/${id}`)
  return response.data
}

export async function takeTicket(id: number): Promise<Ticket> {
  const response = await api.post<Ticket>(`/tickets/${id}/take`)
  return response.data
}

export async function closeTicket(id: number, resolution: string): Promise<Ticket> {
  const response = await api.post<Ticket>(`/tickets/${id}/close`, { resolution })
  return response.data
}

export async function escalateTicket(id: number): Promise<Ticket> {
  const response = await api.post<Ticket>(`/tickets/${id}/escalate`)
  return response.data
}

export async function fetchSummary(): Promise<Summary> {
  const response = await api.get<Summary>('/summary')
  return response.data
}
