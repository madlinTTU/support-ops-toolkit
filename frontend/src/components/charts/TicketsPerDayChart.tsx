import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AsyncContent } from '@/components/AsyncContent'
import { ChartCard } from '@/components/charts/ChartCard'
import { useTicketsPerDay } from '@/hooks/use-stats'
import {
  AXIS,
  CHART_COLORS,
  GRID,
  SURFACE,
  TOOLTIP,
  asText,
  formatDayLong,
  formatDayTick,
  yAxisLabel,
} from '@/lib/chart'

export function TicketsPerDayChart() {
  const query = useTicketsPerDay()
  // The API sends 30 days also when there are no tickets, so "no data" means all the days are zero.
  const isEmpty = query.data !== undefined && query.data.every((row) => row.ticketCount === 0)

  return (
    <ChartCard title="Tickets created per day" subtitle="Last 30 days, tickets">
      <AsyncContent
        bare
        isPending={query.isPending}
        error={query.error}
        isEmpty={isEmpty}
        emptyMessage="No tickets were created in the last 30 days."
        onRetry={() => void query.refetch()}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={query.data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid vertical={false} {...GRID} />
            <XAxis dataKey="day" tickFormatter={formatDayTick} minTickGap={32} {...AXIS} />
            <YAxis allowDecimals={false} width={52} label={yAxisLabel('Tickets')} {...AXIS} />
            <Tooltip
              {...TOOLTIP}
              cursor={{ stroke: 'var(--chart-axis)' }}
              labelFormatter={(day) => formatDayLong(asText(day))}
              formatter={(value) => [value, 'Tickets created']}
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
      </AsyncContent>
    </ChartCard>
  )
}
