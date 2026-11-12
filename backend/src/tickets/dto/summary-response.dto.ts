import { ApiProperty } from '@nestjs/swagger'

export class SummaryResponse {
  @ApiProperty() openCount: number
  @ApiProperty() escalatedCount: number
  @ApiProperty({ description: 'Closed tickets that have an SLA deadline' }) closedCount: number
  @ApiProperty({ description: 'Of those, closed not later than the deadline' }) onTimeCount: number
  @ApiProperty({ description: 'Share of tickets closed on time, 0 to 100' }) onTimePercent: number
}
