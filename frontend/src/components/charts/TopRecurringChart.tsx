import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TopRecurring } from '@/api/types'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { AXIS, CHART_COLORS, GRID, axisLabel, formatCount, truncate } from '@/lib/chart'
import { humanize } from '@/lib/format'

const MAX_LABEL_LENGTH = 34

export function TopRecurringChart({ data }: { data: TopRecurring[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 0 }}>
        <CartesianGrid horizontal={false} {...GRID} />
        <XAxis type="number" allowDecimals={false} height={44} label={axisLabel('Tickets')} {...AXIS} />
        <YAxis
          type="category"
          dataKey="subject"
          width={250}
          interval={0}
          tickFormatter={(subject: string) => truncate(subject, MAX_LABEL_LENGTH)}
          {...AXIS}
        />
        <Tooltip
          cursor={{ fill: 'var(--color-hover)' }}
          content={(props) => {
            const row: TopRecurring | undefined = props.payload?.[0]?.payload
            if (!props.active || row === undefined) {
              return null
            }
            return (
              <ChartTooltip
                heading={row.subject}
                rows={[{ label: 'tickets', value: formatCount(row.ticketCount), color: CHART_COLORS[0] }]}
                note={humanize(row.category)}
              />
            )
          }}
        />
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
  )
}
