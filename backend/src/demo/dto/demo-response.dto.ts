import { ApiProperty } from '@nestjs/swagger'

export class ResetResultResponse {
  @ApiProperty({ description: 'The same seed gives the same tickets' }) seed: number
  @ApiProperty() removedTickets: number
  @ApiProperty() createdTickets: number
  @ApiProperty() triagedTickets: number
  @ApiProperty() escalatedTickets: number
  @ApiProperty({ description: 'Knowledge-base candidates found in the new data' }) candidates: number
}
