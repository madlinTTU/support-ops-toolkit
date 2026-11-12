import { useMutation, useQueryClient } from '@tanstack/react-query'
import { closeTicket, escalateTicket, takeTicket } from '@/api/tickets'

// Take, close and escalate for one ticket. After a change the list, the ticket and the summary are loaded again.
// The mutation stays "pending" until that is done, so the buttons stay disabled and the page never shows old data.
export function useTicketActions(ticketId: number) {
  const queryClient = useQueryClient()

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['tickets'] }),
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] }),
      queryClient.invalidateQueries({ queryKey: ['summary'] }),
    ])
  }

  const take = useMutation({ mutationFn: () => takeTicket(ticketId), onSuccess: refresh })
  const close = useMutation({
    mutationFn: (resolution: string) => closeTicket(ticketId, resolution),
    onSuccess: refresh,
  })
  const escalate = useMutation({ mutationFn: () => escalateTicket(ticketId), onSuccess: refresh })

  function resetErrors() {
    take.reset()
    close.reset()
    escalate.reset()
  }

  return {
    isPending: take.isPending || close.isPending || escalate.isPending,
    error: take.error ?? close.error ?? escalate.error,
    take: () => {
      resetErrors()
      take.mutate()
    },
    close: (resolution: string, onSuccess: () => void) => {
      resetErrors()
      close.mutate(resolution, { onSuccess })
    },
    escalate: () => {
      resetErrors()
      escalate.mutate()
    },
  }
}
