import { ApiProperty } from '@nestjs/swagger'
import type { ErrorType } from './app-error.js'

export class ErrorResponse {
  @ApiProperty({
    enum: ['bad_request', 'not_found', 'conflict', 'too_many_requests', 'internal_error'],
    example: 'conflict',
  })
  type: ErrorType

  @ApiProperty({ example: 'Cannot close ticket 7 with status "queued": only tickets in progress can be closed' })
  message: string

  @ApiProperty({ example: 'INVALID_STATUS_CHANGE' })
  code: string
}
