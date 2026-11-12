import { useMutation, useQueryClient } from '@tanstack/react-query'
import { resetDemoData } from '@/api/demo'

// After a reset all the data of the app is new, so everything that was loaded is loaded again.
// The mutation stays "pending" until that is done.
export function useResetDemoData() {
  const queryClient = useQueryClient()
  return useMutation({ mutationFn: resetDemoData, onSuccess: () => queryClient.invalidateQueries() })
}
