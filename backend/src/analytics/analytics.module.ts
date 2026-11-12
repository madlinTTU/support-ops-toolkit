import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module.js'
import { AnalyticsService } from './analytics.service.js'
import { StatsController } from './stats.controller.js'

@Module({
  imports: [DatabaseModule],
  controllers: [StatsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
