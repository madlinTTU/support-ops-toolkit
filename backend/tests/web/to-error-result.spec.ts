import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ConflictError, NotFoundError } from '../../src/web/app-error.js'
import { toErrorResult } from '../../src/web/to-error-response.js'

describe('toErrorResult', () => {
  it('toErrorResult_notFoundError_returns404WithItsCode', () => {
    expect(toErrorResult(new NotFoundError('TICKET_NOT_FOUND', 'Ticket 5 does not exist'))).toEqual({
      status: 404,
      body: { type: 'not_found', message: 'Ticket 5 does not exist', code: 'TICKET_NOT_FOUND' },
    })
  })

  it('toErrorResult_conflictError_returns409WithItsCode', () => {
    expect(toErrorResult(new ConflictError('INVALID_STATUS_CHANGE', 'Not allowed'))).toEqual({
      status: 409,
      body: { type: 'conflict', message: 'Not allowed', code: 'INVALID_STATUS_CHANGE' },
    })
  })

  it('toErrorResult_validationErrorWithManyMessages_joinsThemInOneMessage', () => {
    const exception = new BadRequestException({ message: ['status is wrong', 'category is wrong'] })

    expect(toErrorResult(exception)).toEqual({
      status: 400,
      body: { type: 'bad_request', message: 'status is wrong; category is wrong', code: 'INVALID_INPUT' },
    })
  })

  it('toErrorResult_unknownRoute_returns404', () => {
    expect(toErrorResult(new NotFoundException('Cannot GET /api/nothing')).body.type).toBe('not_found')
  })

  it('toErrorResult_unexpectedError_returns500WithoutDetails', () => {
    expect(toErrorResult(new Error('password=secret in the stack'))).toEqual({
      status: 500,
      body: { type: 'internal_error', message: 'Unexpected error', code: 'INTERNAL_ERROR' },
    })
  })
})
