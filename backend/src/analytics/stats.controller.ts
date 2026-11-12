import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AnalyticsService } from './analytics.service.js'
import type { ResponseTimesRow, TicketsPerDayRow, TopRecurringRow, VolumeRow } from './analytics.service.js'
import {
  ResponseTimesResponse,
  TicketsPerDayResponse,
  TopRecurringResponse,
  VolumeByCategoryResponse,
} from './dto/stats-response.dto.js'

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get('volume-by-category')
  @ApiOperation({ summary: 'Tickets created in the last 30 days per category' })
  @ApiOkResponse({ type: [VolumeByCategoryResponse] })
  volumeByCategory(): Promise<VolumeRow[]> {
    return this.analytics.volumeByCategory()
  }

  @Get('tickets-per-day')
  @ApiOperation({ summary: 'Tickets created per day for the last 30 days, days without tickets show 0' })
  @ApiOkResponse({ type: [TicketsPerDayResponse] })
  ticketsPerDay(): Promise<TicketsPerDayRow[]> {
    return this.analytics.ticketsPerDay()
  }

  @Get('response-times')
  @ApiOperation({ summary: 'First response time in minutes per priority: average, median and 90th percentile' })
  @ApiOkResponse({ type: [ResponseTimesResponse] })
  responseTimes(): Promise<ResponseTimesRow[]> {
    return this.analytics.responseTimes()
  }

  @Get('top-recurring')
  @ApiOperation({ summary: 'The 10 knowledge-base candidates with the most tickets' })
  @ApiOkResponse({ type: [TopRecurringResponse] })
  topRecurring(): Promise<TopRecurringRow[]> {
    return this.analytics.topRecurring()
  }
}
