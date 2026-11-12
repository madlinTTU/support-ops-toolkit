import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional } from 'class-validator'
import { SearchQuery } from '../../search/search-query.dto.js'
import { TICKET_CATEGORIES } from '../../tickets/ticket.types.js'
import type { TicketCategory } from '../../tickets/ticket.types.js'
import { KB_CANDIDATE_STATUSES } from './kb-candidate.dto.js'
import type { KbCandidateStatus } from './kb-candidate.dto.js'

export class ListKbCandidatesQuery extends SearchQuery {
  @ApiPropertyOptional({ enum: TICKET_CATEGORIES })
  @IsOptional()
  @IsIn(TICKET_CATEGORIES)
  category?: TicketCategory

  @ApiPropertyOptional({ enum: KB_CANDIDATE_STATUSES })
  @IsOptional()
  @IsIn(KB_CANDIDATE_STATUSES)
  status?: KbCandidateStatus
}
