import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export const MAX_SEARCH_LENGTH = 100

export class SearchQuery {
  @ApiPropertyOptional({ description: 'Finds this text, ignoring letter case', maxLength: MAX_SEARCH_LENGTH })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_SEARCH_LENGTH)
  search?: string
}
