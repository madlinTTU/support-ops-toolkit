import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AsyncContent } from '@/components/AsyncContent'
import { ChartCard } from '@/components/charts/ChartCard'
import { useResponseTimes } from '@/hooks/use-stats'
import { AXIS, CHART_COLORS, GRID, TOOLTIP, asText, yAxisLabel } from '@/lib/chart'
import { humanize } from '@/lib/format'

export function ResponseTimesChart() {
  const query = useResponseTimes()

  return (
    <ChartCard title="First response time by priority" subtitle="All tickets with a response, minutes">
      <AsyncContent
        bare
        isPending={query.isPending}
        error={query.error}
        isEmpty={query.data?.length === 0}
        emptyMessage="No ticket has received a first response yet."
        onRetry={() => void query.refetch()}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={query.data} barGap={2} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid vertical={false} {...GRID} />
            <XAxis dataKey="priority" tickFormatter={humanize} {...AXIS} />
            <YAxis
              domain={[0, (max: number) => Math.ceil(max / 1000) * 1000]}
              tickFormatter={(minutes: number) => minutes.toLocaleString('en-US')}
              width={60}
              label={yAxisLabel('Minutes')}
              {...AXIS}
            />
            <Legend iconType="rect" iconSize={10} itemSorter={null} wrapperStyle={{ fontSize: 13 }} />
            <Tooltip
              {...TOOLTIP}
              cursor={{ fill: 'var(--color-hover)' }}
              labelFormatter={(priority) => `${humanize(asText(priority))} priority`}
              formatter={(minutes) => `${asText(minutes)} min`}
            />
            <Bar
              dataKey="averageMinutes"
              name="Average"
              fill={CHART_COLORS[0]}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              isAnimationActive={false}
            />
            <Bar
              dataKey="medianMinutes"
              name="Median"
              fill={CHART_COLORS[1]}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              isAnimationActive={false}
            />
            <Bar
              dataKey="p90Minutes"
              name="90th percentile"
              fill={CHART_COLORS[2]}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </AsyncContent>
    </ChartCard>
  )
}
