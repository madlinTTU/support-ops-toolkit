import { applyDecorators } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { ErrorResponse } from './error-response.js'

// Shows the error responses of an endpoint in Swagger, e.g. ApiErrorResponses(404, 409).
export function ApiErrorResponses(...statuses: number[]) {
  return applyDecorators(...statuses.map((status) => ApiResponse({ status, type: ErrorResponse })))
}
