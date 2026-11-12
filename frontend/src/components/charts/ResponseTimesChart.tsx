import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ResponseTimes } from '@/api/types'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { AXIS, CHART_COLORS, GRID, axisLabel, formatCount, niceTicks } from '@/lib/chart'
import { humanize } from '@/lib/format'

const SERIES = [
  { key: 'averageMinutes', name: 'Average', color: CHART_COLORS[0] },
  { key: 'medianMinutes', name: 'Median', color: CHART_COLORS[1] },
  { key: 'p90Minutes', name: '90th percentile', color: CHART_COLORS[2] },
] as const

export function ResponseTimesChart({ data }: { data: ResponseTimes[] }) {
  const ticks = niceTicks(Math.max(0, ...data.map((row) => row.p90Minutes)))
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barGap={2} barCategoryGap="25%" margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
        <CartesianGrid vertical={false} {...GRID} />
        <XAxis dataKey="priority" tickFormatter={humanize} {...AXIS} />
        <YAxis
          ticks={ticks}
          domain={[0, ticks[ticks.length - 1]]}
          tickFormatter={formatCount}
          width={60}
          label={axisLabel('Minutes', -90)}
          {...AXIS}
        />
        <Legend
          iconType="rect"
          iconSize={10}
          itemSorter={null}
          wrapperStyle={{ fontSize: 13 }}
          formatter={(name: string) => <span style={{ color: 'var(--color-ink)' }}>{name}</span>}
        />
        <Tooltip
          cursor={{ fill: 'var(--color-hover)' }}
          content={(props) => {
            const row: ResponseTimes | undefined = props.payload?.[0]?.payload
            if (!props.active || row === undefined) {
              return null
            }
            return (
              <ChartTooltip
                heading={`${humanize(row.priority)} priority`}
                rows={SERIES.map((series) => ({
                  label: `min, ${series.name.toLowerCase()}`,
                  value: formatCount(row[series.key]),
                  color: series.color,
                }))}
                note={`${formatCount(row.ticketCount)} tickets with a first response`}
              />
            )
          }}
        />
        {SERIES.map((series) => (
          <Bar
            key={series.key}
            dataKey={series.key}
            name={series.name}
            fill={series.color}
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
