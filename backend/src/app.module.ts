import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { HealthModule } from './health/health.module.js'
import { SlaModule } from './sla/sla.module.js'
import { TriageModule } from './triage/triage.module.js'

@Module({
  imports: [ScheduleModule.forRoot(), HealthModule, TriageModule, SlaModule],
})
export class AppModule {}
