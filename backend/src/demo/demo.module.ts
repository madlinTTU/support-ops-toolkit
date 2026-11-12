import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module.js'
import { KbModule } from '../knowledge-base/kb.module.js'
import { SlaModule } from '../sla/sla.module.js'
import { TriageModule } from '../triage/triage.module.js'
import { DemoController } from './demo.controller.js'
import { DemoDataService } from './demo-data.service.js'
import { DemoResetService } from './demo-reset.service.js'

@Module({
  imports: [DatabaseModule, TriageModule, SlaModule, KbModule],
  controllers: [DemoController],
  providers: [DemoDataService, DemoResetService],
  exports: [DemoDataService],
})
export class DemoModule {}
