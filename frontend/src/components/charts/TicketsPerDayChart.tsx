import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TicketsPerDay } from '@/api/types'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { AXIS, CHART_COLORS, GRID, SURFACE, axisLabel, formatCount, formatDayLong, formatDayTick } from '@/lib/chart'

export function TicketsPerDayChart({ data }: { data: TicketsPerDay[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
        <CartesianGrid vertical={false} {...GRID} />
        <XAxis dataKey="day" tickFormatter={formatDayTick} minTickGap={32} {...AXIS} />
        <YAxis allowDecimals={false} width={52} label={axisLabel('Tickets', -90)} {...AXIS} />
        <Tooltip
          cursor={{ stroke: 'var(--chart-axis)' }}
          content={(props) => {
            const row: TicketsPerDay | undefined = props.payload?.[0]?.payload
            if (!props.active || row === undefined) {
              return null
            }
            return (
              <ChartTooltip
                heading={formatDayLong(row.day)}
                rows={[{ label: 'tickets created', value: formatCount(row.ticketCount), color: CHART_COLORS[0] }]}
              />
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="ticketCount"
          stroke={CHART_COLORS[0]}
          strokeWidth={2}
          fill={CHART_COLORS[0]}
          fillOpacity={0.1}
          dot={false}
          activeDot={{ r: 4, fill: CHART_COLORS[0], stroke: SURFACE, strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
