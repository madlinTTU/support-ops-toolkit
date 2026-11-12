import type { ReactNode } from 'react'
import { getErrorMessage } from '@/lib/api-error'
import { BUTTON_SECONDARY } from '@/lib/styles'

interface AsyncContentProps {
  isPending: boolean
  error: Error | null
  isEmpty: boolean
  emptyMessage: string
  onRetry: () => void
  children: ReactNode
}

const BOX = 'rounded-lg border border-line bg-white p-8'

function Skeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className={`${BOX} space-y-4`}>
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="h-4 animate-pulse rounded bg-line motion-reduce:animate-none" />
      ))}
    </div>
  )
}

// Shows one of four states of a list: loading, error, empty or the content itself.
export function AsyncContent({ isPending, error, isEmpty, emptyMessage, onRetry, children }: AsyncContentProps) {
  if (isPending) {
    return <Skeleton />
  }
  if (error !== null) {
    return (
      <div role="alert" className="rounded-lg border border-late/30 bg-late/5 p-8">
        <p className="font-medium text-late">Could not load the data</p>
        <p className="mt-1 text-sm">{getErrorMessage(error)}</p>
        <button type="button" onClick={onRetry} className={`${BUTTON_SECONDARY} mt-4`}>
          Try again
        </button>
      </div>
    )
  }
  if (isEmpty) {
    return <p className={`${BOX} text-muted`}>{emptyMessage}</p>
  }
  return <>{children}</>
}
