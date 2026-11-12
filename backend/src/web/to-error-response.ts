import { HttpException } from '@nestjs/common'
import { AppError } from './app-error.js'
import type { ErrorType } from './app-error.js'
import type { ErrorResponse } from './error-response.js'

export interface ErrorResult {
  status: number
  body: ErrorResponse
}

const INTERNAL_ERROR: ErrorResult = {
  status: 500,
  body: { type: 'internal_error', message: 'Unexpected error', code: 'INTERNAL_ERROR' },
}

export function toErrorResult(exception: unknown): ErrorResult {
  if (exception instanceof AppError) {
    return {
      status: exception.status,
      body: { type: exception.type, message: exception.message, code: exception.code },
    }
  }
  if (exception instanceof HttpException) {
    return fromHttpException(exception)
  }
  return INTERNAL_ERROR
}

// Errors thrown by Nest itself: failed validation (400), unknown route (404) and so on.
function fromHttpException(exception: HttpException): ErrorResult {
  const status = exception.getStatus()
  const type = typeOf(status)
  const code = type === 'bad_request' ? 'INVALID_INPUT' : type === 'not_found' ? 'NOT_FOUND' : 'HTTP_ERROR'
  return { status, body: { type, message: messageOf(exception), code } }
}

function typeOf(status: number): ErrorType {
  if (status === 400) {
    return 'bad_request'
  }
  if (status === 404) {
    return 'not_found'
  }
  return status === 409 ? 'conflict' : 'internal_error'
}

// ValidationPipe puts a list of messages into the response, other errors have a single text.
function messageOf(exception: HttpException): string {
  const response = exception.getResponse()
  if (typeof response === 'string') {
    return response
  }
  const message = (response as { message?: string | string[] }).message
  if (Array.isArray(message)) {
    return message.join('; ')
  }
  return message ?? exception.message
}
