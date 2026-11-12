import { Module } from '@nestjs/common'
import { AnalyticsModule } from '../analytics/analytics.module.js'
import { DatabaseModule } from '../database/database.module.js'
import { ReportService } from './report.service.js'

@Module({
  imports: [DatabaseModule, AnalyticsModule],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportsModule {}
