import { api } from '@/api/client'
import type { ResetResult } from '@/api/types'

export async function resetDemoData(): Promise<ResetResult> {
  const response = await api.post<ResetResult>('/demo/reset')
  return response.data
}
