import { useSummary } from '@/hooks/use-summary'
import { getErrorMessage } from '@/lib/api-error'

function Figure({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <div className="text-3xl font-semibold leading-none">{value}</div>
      <div className="mt-1.5 text-sm text-white/70">{label}</div>
      {note !== undefined && <div className="text-xs text-white/50">{note}</div>}
    </div>
  )
}

export function Vitals() {
  const { data, error, isPending } = useSummary()

  if (error !== null) {
    return <p className="text-sm text-red-300">Summary is not available. {getErrorMessage(error)}</p>
  }
  if (isPending) {
    return <p className="text-sm text-white/50">Loading summary...</p>
  }
  return (
    <div className="space-y-6">
      <Figure label="Open tickets" value={String(data.openCount)} />
      <Figure label="Escalated" value={String(data.escalatedCount)} />
      <Figure
        label="Closed on time"
        value={`${data.onTimePercent}%`}
        note={`${data.onTimeCount} of ${data.closedCount} closed tickets`}
      />
    </div>
  )
}
