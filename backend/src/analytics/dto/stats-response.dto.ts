import { ApiProperty } from '@nestjs/swagger'
import { TICKET_PRIORITIES } from '../../tickets/ticket.types.js'

export class VolumeByCategoryResponse {
  @ApiProperty({ description: 'A ticket category or "untriaged"' }) category: string
  @ApiProperty() ticketCount: number
  @ApiProperty({ description: 'Share of all tickets of the last 30 days, 0 to 100' }) percent: number
}

export class TicketsPerDayResponse {
  @ApiProperty({ example: '2026-06-30' }) day: string
  @ApiProperty() ticketCount: number
}

export class ResponseTimesResponse {
  @ApiProperty({ enum: TICKET_PRIORITIES }) priority: string
  @ApiProperty() ticketCount: number
  @ApiProperty() averageMinutes: number
  @ApiProperty() medianMinutes: number
  @ApiProperty() p90Minutes: number
}

export class TopRecurringResponse {
  @ApiProperty() id: number
  @ApiProperty() category: string
  @ApiProperty() subject: string
  @ApiProperty() ticketCount: number
}
