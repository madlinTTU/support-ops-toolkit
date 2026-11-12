import { Module } from '@nestjs/common'
import { HealthModule } from './health/health.module.js'
import { TriageModule } from './triage/triage.module.js'

@Module({
  imports: [HealthModule, TriageModule],
})
export class AppModule {}
