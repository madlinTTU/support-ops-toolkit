import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AsyncContent } from '@/components/AsyncContent'
import { ChartCard } from '@/components/charts/ChartCard'
import { useTopRecurring } from '@/hooks/use-stats'
import { AXIS, CHART_COLORS, GRID, TOOLTIP, truncate, xAxisLabel } from '@/lib/chart'

const MAX_LABEL_LENGTH = 34

export function TopRecurringChart() {
  const query = useTopRecurring()

  return (
    <ChartCard title="Most frequent recurring issues" subtitle="Top 10 knowledge-base candidates, tickets">
      <AsyncContent
        bare
        isPending={query.isPending}
        error={query.error}
        isEmpty={query.data?.length === 0}
        emptyMessage="No recurring issues found yet. They appear when three or more closed tickets look alike."
        onRetry={() => void query.refetch()}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={query.data} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 0 }}>
            <CartesianGrid horizontal={false} {...GRID} />
            <XAxis type="number" allowDecimals={false} height={44} label={xAxisLabel('Tickets')} {...AXIS} />
            <YAxis
              type="category"
              dataKey="subject"
              width={250}
              interval={0}
              tickFormatter={(subject: string) => truncate(subject, MAX_LABEL_LENGTH)}
              {...AXIS}
            />
            <Tooltip {...TOOLTIP} cursor={{ fill: 'var(--color-hover)' }} formatter={(value) => [value, 'Tickets']} />
            <Bar
              dataKey="ticketCount"
              fill={CHART_COLORS[0]}
              radius={[0, 4, 4, 0]}
              maxBarSize={18}
              isAnimationActive={false}
            >
              <LabelList dataKey="ticketCount" position="right" fill="var(--color-ink)" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </AsyncContent>
    </ChartCard>
  )
}
