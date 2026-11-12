import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiErrorResponses } from '../web/api-error-responses.js'
import { CloseTicketBody } from './dto/close-ticket.dto.js'
import { ListTicketsQuery } from './dto/list-tickets-query.dto.js'
import { TicketResponse } from './dto/ticket-response.dto.js'
import { TicketsService } from './tickets.service.js'

@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'List tickets, the most urgent first (by priority, then by earliest deadline)' })
  @ApiOkResponse({ type: [TicketResponse] })
  @ApiErrorResponses(400)
  list(@Query() query: ListTicketsQuery): Promise<TicketResponse[]> {
    return this.ticketsService.list(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one ticket' })
  @ApiOkResponse({ type: TicketResponse })
  @ApiErrorResponses(400, 404)
  get(@Param('id', ParseIntPipe) id: number): Promise<TicketResponse> {
    return this.ticketsService.get(id)
  }

  @Post(':id/take')
  @HttpCode(200)
  @ApiOperation({ summary: 'Take a queued ticket: it becomes in_progress and gets its first response time' })
  @ApiOkResponse({ type: TicketResponse })
  @ApiErrorResponses(400, 404, 409)
  take(@Param('id', ParseIntPipe) id: number): Promise<TicketResponse> {
    return this.ticketsService.take(id)
  }

  @Post(':id/close')
  @HttpCode(200)
  @ApiOperation({ summary: 'Close a ticket that is in progress, with a resolution text' })
  @ApiOkResponse({ type: TicketResponse })
  @ApiErrorResponses(400, 404, 409)
  close(@Param('id', ParseIntPipe) id: number, @Body() body: CloseTicketBody): Promise<TicketResponse> {
    return this.ticketsService.close(id, body.resolution)
  }

  @Post(':id/escalate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Escalate an open ticket' })
  @ApiOkResponse({ type: TicketResponse })
  @ApiErrorResponses(400, 404, 409)
  escalate(@Param('id', ParseIntPipe) id: number): Promise<TicketResponse> {
    return this.ticketsService.escalate(id)
  }
}
