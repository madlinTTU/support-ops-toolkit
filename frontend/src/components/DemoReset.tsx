import { useState } from 'react'
import { useResetDemoData } from '@/hooks/use-demo'
import { getErrorMessage } from '@/lib/api-error'
import { formatCount } from '@/lib/chart'

const BUTTON =
  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

// The button asks before it erases anything.
export function DemoReset() {
  const reset = useResetDemoData()
  const [confirming, setConfirming] = useState(false)

  function start() {
    reset.reset()
    setConfirming(true)
  }

  return (
    <div className="mt-6">
      {confirming ? (
        <div className="rounded-md bg-white/10 p-3 text-sm">
          <p>Erase all demo data and create new data?</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={reset.isPending}
              className={`${BUTTON} bg-late text-white hover:bg-late/90`}
              onClick={() => reset.mutate(undefined, { onSettled: () => setConfirming(false) })}
            >
              {reset.isPending ? 'Resetting...' : 'Reset'}
            </button>
            <button
              type="button"
              disabled={reset.isPending}
              className={`${BUTTON} border border-white/20 hover:bg-white/10`}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`${BUTTON} w-full border border-white/20 text-left text-white/70 hover:bg-white/10 hover:text-white`}
          onClick={start}
        >
          Reset demo data
        </button>
      )}
      {reset.isSuccess && !confirming && (
        <p role="status" className="mt-2 px-1 text-xs text-white/70">
          New data is ready: {formatCount(reset.data.createdTickets)} tickets, {formatCount(reset.data.candidates)}{' '}
          recurring issues.
        </p>
      )}
      {reset.error !== null && !confirming && (
        <p role="alert" className="mt-2 px-1 text-xs text-red-300">
          {getErrorMessage(reset.error)}
        </p>
      )}
    </div>
  )
}
