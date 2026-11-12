import { api } from '@/api/client'
import type { KbCandidate, KbCandidateQuery, KbDecision } from '@/api/types'

export async function fetchKbCandidates(query: KbCandidateQuery): Promise<KbCandidate[]> {
  const params: Record<string, string> = {}
  if (query.category !== 'all') {
    params.category = query.category
  }
  if (query.status !== 'all') {
    params.status = query.status
  }
  if (query.search !== '') {
    params.search = query.search
  }
  const response = await api.get<KbCandidate[]>('/kb-candidates', { params })
  return response.data
}

export async function decideKbCandidate(id: number, status: KbDecision): Promise<KbCandidate> {
  const response = await api.patch<KbCandidate>(`/kb-candidates/${id}`, { status })
  return response.data
}
