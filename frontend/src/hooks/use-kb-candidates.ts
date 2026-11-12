import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { decideKbCandidate, fetchKbCandidates } from '@/api/kb-candidates'
import type { KbCandidateQuery, KbDecision } from '@/api/types'

export function useKbCandidates(query: KbCandidateQuery) {
  return useQuery({
    queryKey: ['kb-candidates', query],
    queryFn: () => fetchKbCandidates(query),
    placeholderData: keepPreviousData,
  })
}

interface Decision {
  id: number
  status: KbDecision
}

export function useDecideKbCandidate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: Decision) => decideKbCandidate(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb-candidates'] }),
  })
}
