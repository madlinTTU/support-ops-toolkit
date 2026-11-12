import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module.js'
import { TriageModule } from '../triage/triage.module.js'
import { SlaScheduler } from './sla.scheduler.js'
import { SlaService } from './sla.service.js'

@Module({
  imports: [DatabaseModule, TriageModule],
  providers: [SlaService, SlaScheduler],
  exports: [SlaService],
})
export class SlaModule {}
