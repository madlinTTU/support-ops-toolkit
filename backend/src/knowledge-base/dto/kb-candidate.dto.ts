import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'

export const KB_CANDIDATE_STATUSES = ['proposed', 'accepted', 'dismissed'] as const
export const KB_DECISIONS = ['accepted', 'dismissed'] as const

export type KbCandidateStatus = (typeof KB_CANDIDATE_STATUSES)[number]
export type KbDecision = (typeof KB_DECISIONS)[number]

export class KbCandidateResponse {
  @ApiProperty() id: number
  @ApiProperty() category: string
  @ApiProperty() subject: string
  @ApiProperty({ description: 'The text of the most typical ticket of the group' }) exampleText: string
  @ApiProperty() ticketCount: number
  @ApiProperty({ enum: KB_CANDIDATE_STATUSES }) status: KbCandidateStatus
  @ApiProperty({ type: String, format: 'date-time' }) firstSeenAt: Date
  @ApiProperty({ type: String, format: 'date-time' }) lastSeenAt: Date
}

export class UpdateKbCandidateBody {
  @ApiProperty({ enum: KB_DECISIONS })
  @IsIn(KB_DECISIONS)
  status: KbDecision
}
