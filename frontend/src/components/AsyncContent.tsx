import type { ReactNode } from 'react'
import { getErrorMessage } from '@/lib/api-error'
import { BUTTON_SECONDARY } from '@/lib/styles'

interface AsyncContentProps {
  isPending: boolean
  error: Error | null
  isEmpty: boolean
  emptyMessage: string
  onRetry: () => void
  // Without its own frame: for content that already sits inside a card.
  bare?: boolean
  children: ReactNode
}

const FRAME = 'rounded-lg border p-8'

function Skeleton({ frame }: { frame: string }) {
  return (
    <div aria-busy="true" aria-label="Loading" className={`${frame} space-y-4 border-line bg-surface`}>
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="h-4 animate-pulse rounded bg-line motion-reduce:animate-none" />
      ))}
    </div>
  )
}

// Shows one of four states of a list: loading, error, empty or the content itself.
export function AsyncContent({
  isPending,
  error,
  isEmpty,
  emptyMessage,
  onRetry,
  bare = false,
  children,
}: AsyncContentProps) {
  const frame = bare ? 'py-4' : FRAME
  if (isPending) {
    return <Skeleton frame={bare ? 'py-4' : FRAME} />
  }
  if (error !== null) {
    return (
      <div role="alert" className={`${frame} border-late/30 bg-late/5`}>
        <p className="font-medium text-late">Could not load the data</p>
        <p className="mt-1 text-sm">{getErrorMessage(error)}</p>
        <button type="button" onClick={onRetry} className={`${BUTTON_SECONDARY} mt-4`}>
          Try again
        </button>
      </div>
    )
  }
  if (isEmpty) {
    return <p className={`${frame} border-line bg-surface text-muted`}>{emptyMessage}</p>
  }
  return <>{children}</>
}
