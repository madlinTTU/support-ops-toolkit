import { ApiProperty } from '@nestjs/swagger'
import { TICKET_CATEGORIES, TICKET_CHANNELS, TICKET_PRIORITIES, TICKET_STATUSES } from '../ticket.types.js'
import type { TicketCategory, TicketChannel, TicketPriority, TicketStatus } from '../ticket.types.js'

export class TicketResponse {
  @ApiProperty() id: number
  @ApiProperty() subject: string
  @ApiProperty() body: string
  @ApiProperty() customerEmail: string
  @ApiProperty({ enum: TICKET_CHANNELS }) channel: TicketChannel
  @ApiProperty({ enum: TICKET_CATEGORIES, nullable: true }) category: TicketCategory | null
  @ApiProperty({ enum: TICKET_PRIORITIES, nullable: true }) priority: TicketPriority | null
  @ApiProperty({ type: [String] }) tags: string[]
  @ApiProperty({ enum: TICKET_STATUSES }) status: TicketStatus
  @ApiProperty() escalated: boolean
  @ApiProperty({ type: String, format: 'date-time' }) createdAt: Date
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) triagedAt: Date | null
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) slaDueAt: Date | null
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) firstResponseAt: Date | null
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) closedAt: Date | null
  @ApiProperty({ type: String, format: 'date-time', nullable: true }) escalatedAt: Date | null
  @ApiProperty({ type: String, nullable: true }) resolution: string | null

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Minutes until the SLA deadline, negative when overdue. Null for closed or untriaged tickets.',
  })
  minutesLeft: number | null
}
