import { api } from '@/api/client'
import type { KbCandidate, KbDecision } from '@/api/types'

export async function fetchKbCandidates(): Promise<KbCandidate[]> {
  const response = await api.get<KbCandidate[]>('/kb-candidates')
  return response.data
}

export async function decideKbCandidate(id: number, status: KbDecision): Promise<KbCandidate> {
  const response = await api.patch<KbCandidate>(`/kb-candidates/${id}`, { status })
  return response.data
}
