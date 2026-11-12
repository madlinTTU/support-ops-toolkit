export interface TooltipRow {
  label: string
  value: string
  color?: string
}

interface ChartTooltipProps {
  heading: string
  rows: TooltipRow[]
  note?: string
}

// The value leads (strong), the name follows (quiet). A short line in the series colour keys each row.
export function ChartTooltip({ heading, rows, note }: ChartTooltipProps) {
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 text-sm shadow-sm">
      <div className="mb-1 font-medium">{heading}</div>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-2">
          {row.color !== undefined && <span aria-hidden className="h-0.5 w-3" style={{ background: row.color }} />}
          <span className="font-semibold">{row.value}</span>
          <span className="text-muted">{row.label}</span>
        </div>
      ))}
      {note !== undefined && <div className="mt-1 text-xs text-muted">{note}</div>}
    </div>
  )
}
