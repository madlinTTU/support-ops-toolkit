import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AsyncContent } from '@/components/AsyncContent'
import { ChartCard } from '@/components/charts/ChartCard'
import { useVolumeByCategory } from '@/hooks/use-stats'
import { AXIS, CHART_COLORS, GRID, TOOLTIP, asText, yAxisLabel } from '@/lib/chart'
import { humanize } from '@/lib/format'

export function VolumeByCategoryChart() {
  const query = useVolumeByCategory()

  return (
    <ChartCard title="Tickets by category" subtitle="Last 30 days, tickets">
      <AsyncContent
        bare
        isPending={query.isPending}
        error={query.error}
        isEmpty={query.data?.length === 0}
        emptyMessage="No tickets were created in the last 30 days."
        onRetry={() => void query.refetch()}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={query.data} margin={{ top: 20, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid vertical={false} {...GRID} />
            <XAxis dataKey="category" tickFormatter={humanize} interval={0} {...AXIS} />
            <YAxis allowDecimals={false} width={52} label={yAxisLabel('Tickets')} {...AXIS} />
            <Tooltip
              {...TOOLTIP}
              cursor={{ fill: 'var(--color-hover)' }}
              labelFormatter={(category) => humanize(asText(category))}
              formatter={(value) => [value, 'Tickets']}
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
      </AsyncContent>
    </ChartCard>
  )
}
