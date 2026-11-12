import { Module } from '@nestjs/common'
import { AnalyticsModule } from '../analytics/analytics.module.js'
import { DatabaseModule } from '../database/database.module.js'
import { SummaryController } from './summary.controller.js'
import { TicketsController } from './tickets.controller.js'
import { TicketsRepository } from './tickets.repository.js'
import { TicketsService } from './tickets.service.js'

@Module({
  imports: [DatabaseModule, AnalyticsModule],
  controllers: [TicketsController, SummaryController],
  providers: [TicketsService, TicketsRepository],
})
export class TicketsModule {}
