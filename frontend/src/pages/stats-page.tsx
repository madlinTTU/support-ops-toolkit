import { ResponseTimesChart } from '@/components/charts/ResponseTimesChart'
import { TicketsPerDayChart } from '@/components/charts/TicketsPerDayChart'
import { TopRecurringChart } from '@/components/charts/TopRecurringChart'
import { VolumeByCategoryChart } from '@/components/charts/VolumeByCategoryChart'
import { StatsTiles } from '@/components/StatsTiles'

export function StatsPage() {
  return (
    <section>
      <h2 className="text-2xl font-semibold">Statistics</h2>
      <p className="mb-5 mt-1 max-w-xl text-muted">How the support is doing: how much comes in, how fast we answer.</p>
      <StatsTiles />
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TicketsPerDayChart />
        <VolumeByCategoryChart />
        <ResponseTimesChart />
        <TopRecurringChart />
      </div>
    </section>
  )
}
