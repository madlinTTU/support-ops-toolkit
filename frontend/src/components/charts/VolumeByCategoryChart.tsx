import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { VolumeByCategory } from '@/api/types'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { AXIS, CHART_COLORS, GRID, axisLabel, formatCount } from '@/lib/chart'
import { humanize } from '@/lib/format'

export function VolumeByCategoryChart({ data }: { data: VolumeByCategory[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 12, bottom: 4, left: 0 }}>
        <CartesianGrid vertical={false} {...GRID} />
        <XAxis dataKey="category" tickFormatter={humanize} interval={0} {...AXIS} />
        <YAxis allowDecimals={false} width={52} label={axisLabel('Tickets', -90)} {...AXIS} />
        <Tooltip
          cursor={{ fill: 'var(--color-hover)' }}
          content={(props) => {
            const row: VolumeByCategory | undefined = props.payload?.[0]?.payload
            if (!props.active || row === undefined) {
              return null
            }
            return (
              <ChartTooltip
                heading={humanize(row.category)}
                rows={[{ label: 'tickets', value: formatCount(row.ticketCount), color: CHART_COLORS[0] }]}
                note={`${row.percent}% of the tickets of the last 30 days`}
              />
            )
          }}
        />
        <Bar
          dataKey="ticketCount"
          fill={CHART_COLORS[0]}
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
          isAnimationActive={false}
        >
          <LabelList dataKey="ticketCount" position="top" fill="var(--color-ink)" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
