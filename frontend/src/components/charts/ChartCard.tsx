import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subtitle: string
  children: ReactNode
}

// A frame for a chart: the title says what is measured, the subtitle says the period and the unit.
export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mb-4 text-sm text-muted">{subtitle}</p>
      <div className="h-72">{children}</div>
    </section>
  )
}
