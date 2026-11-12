import { isAxiosError } from 'axios'
import type { ApiErrorBody } from '@/api/types'

// Turns any error into a text a person can read. The backend sends { type, message, code }.
export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    if (error.response === undefined) {
      return 'Cannot reach the server. Is the backend running?'
    }
    return error.response.data?.message ?? `Request failed with status ${error.response.status}`
  }
  return error instanceof Error ? error.message : 'Something went wrong'
}
