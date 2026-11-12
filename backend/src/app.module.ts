import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { AnalyticsModule } from './analytics/analytics.module.js'
import { DemoModule } from './demo/demo.module.js'
import { HealthModule } from './health/health.module.js'
import { KbModule } from './knowledge-base/kb.module.js'
import { ReportsModule } from './reports/reports.module.js'
import { SlaModule } from './sla/sla.module.js'
import { TicketsModule } from './tickets/tickets.module.js'
import { TriageModule } from './triage/triage.module.js'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HealthModule,
    TriageModule,
    SlaModule,
    KbModule,
    AnalyticsModule,
    ReportsModule,
    TicketsModule,
    DemoModule,
  ],
})
export class AppModule {}
