import { ChartCard } from '@/components/charts/ChartCard'
import { ResponseTimesChart } from '@/components/charts/ResponseTimesChart'
import { TicketsPerDayChart } from '@/components/charts/TicketsPerDayChart'
import { TopRecurringChart } from '@/components/charts/TopRecurringChart'
import { VolumeByCategoryChart } from '@/components/charts/VolumeByCategoryChart'
import { StatsTiles } from '@/components/StatsTiles'
import { useResponseTimes, useTicketsPerDay, useTopRecurring, useVolumeByCategory } from '@/hooks/use-stats'
import { formatCount } from '@/lib/chart'
import { humanize } from '@/lib/format'

export function StatsPage() {
  const perDay = useTicketsPerDay()
  const volume = useVolumeByCategory()
  const responseTimes = useResponseTimes()
  const topRecurring = useTopRecurring()

  return (
    <section>
      <h2 className="text-2xl font-semibold">Statistics</h2>
      <p className="mb-5 mt-1 max-w-xl text-muted">How the support is doing: how much comes in, how fast we answer.</p>
      <StatsTiles />
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard
          title="Tickets created per day"
          subtitle="Last 30 days, tickets"
          query={perDay}
          emptyMessage="No tickets were created in the last 30 days."
          isEmpty={(data) => data.every((row) => row.ticketCount === 0)}
          toTable={(data) => ({
            headers: ['Day', 'Tickets'],
            rows: data.map((row) => [row.day, formatCount(row.ticketCount)]),
          })}
        >
          {(data) => <TicketsPerDayChart data={data} />}
        </ChartCard>
        <ChartCard
          title="Tickets by category"
          subtitle="Last 30 days, tickets"
          query={volume}
          emptyMessage="No tickets were created in the last 30 days."
          toTable={(data) => ({
            headers: ['Category', 'Tickets', 'Share'],
            rows: data.map((row) => [humanize(row.category), formatCount(row.ticketCount), `${row.percent}%`]),
          })}
        >
          {(data) => <VolumeByCategoryChart data={data} />}
        </ChartCard>
        <ChartCard
          title="First response time by priority"
          subtitle="All tickets with a response, minutes"
          query={responseTimes}
          emptyMessage="No ticket has received a first response yet."
          toTable={(data) => ({
            headers: ['Priority', 'Tickets', 'Average, min', 'Median, min', '90th percentile, min'],
            rows: data.map((row) => [
              humanize(row.priority),
              formatCount(row.ticketCount),
              formatCount(row.averageMinutes),
              formatCount(row.medianMinutes),
              formatCount(row.p90Minutes),
            ]),
          })}
        >
          {(data) => <ResponseTimesChart data={data} />}
        </ChartCard>
        <ChartCard
          title="Most frequent recurring issues"
          subtitle="Top 10 knowledge-base candidates, tickets"
          query={topRecurring}
          emptyMessage="No recurring issues found yet. They appear when three or more closed tickets look alike."
          toTable={(data) => ({
            headers: ['Issue', 'Category', 'Tickets'],
            rows: data.map((row) => [row.subject, humanize(row.category), formatCount(row.ticketCount)]),
          })}
        >
          {(data) => <TopRecurringChart data={data} />}
        </ChartCard>
      </div>
    </section>
  )
}
