import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module.js'
import { AnalyticsService } from './analytics.service.js'

@Module({
  imports: [DatabaseModule],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
