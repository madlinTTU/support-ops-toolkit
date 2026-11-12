import { useSummary } from '@/hooks/use-summary'
import { getErrorMessage } from '@/lib/api-error'
import { formatCount } from '@/lib/chart'
import { BUTTON_SECONDARY } from '@/lib/styles'

interface TileProps {
  label: string
  value: string
  note: string
}

// A big number with a short label. The number is not calculated here, it comes from the API.
function Tile({ label, value, note }: TileProps) {
  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-2 text-4xl font-semibold leading-none proportional-nums">{value}</div>
      <div className="mt-2 text-sm text-muted">{note}</div>
    </div>
  )
}

export function StatsTiles() {
  const { data, error, isPending, refetch } = useSummary()

  if (isPending) {
    return (
      <div aria-busy="true" aria-label="Loading" className="grid grid-cols-3 gap-6">
        {[0, 1, 2].map((tile) => (
          <div key={tile} className="h-32 animate-pulse rounded-lg bg-line motion-reduce:animate-none" />
        ))}
      </div>
    )
  }
  if (error !== null) {
    return (
      <div role="alert" className="rounded-lg border border-late/30 bg-late/5 p-5">
        <p className="font-medium text-late">Could not load the numbers</p>
        <p className="mt-1 text-sm">{getErrorMessage(error)}</p>
        <button type="button" onClick={() => void refetch()} className={`${BUTTON_SECONDARY} mt-3`}>
          Try again
        </button>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-3 gap-6">
      <Tile
        label="Closed on time"
        value={`${data.onTimePercent}%`}
        note={`${formatCount(data.onTimeCount)} of ${formatCount(data.closedCount)} closed tickets met their deadline`}
      />
      <Tile label="Open tickets" value={formatCount(data.openCount)} note="Not closed yet" />
      <Tile label="Escalated open tickets" value={formatCount(data.escalatedCount)} note="Open and marked as urgent" />
    </div>
  )
}
