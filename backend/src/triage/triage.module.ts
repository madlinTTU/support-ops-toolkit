import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module.js'
import { TriageService } from './triage.service.js'

@Module({
  imports: [DatabaseModule],
  providers: [TriageService],
  exports: [TriageService],
})
export class TriageModule {}
