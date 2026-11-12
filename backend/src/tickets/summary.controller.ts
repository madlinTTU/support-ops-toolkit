import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { SummaryResponse } from './dto/summary-response.dto.js'
import { TicketsService } from './tickets.service.js'

@ApiTags('summary')
@Controller('summary')
export class SummaryController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Open tickets, escalated tickets and the on-time rate of closed tickets' })
  @ApiOkResponse({ type: SummaryResponse })
  getSummary(): Promise<SummaryResponse> {
    return this.ticketsService.getSummary()
  }
}
