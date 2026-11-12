export type ErrorType = 'bad_request' | 'not_found' | 'conflict' | 'internal_error'

export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly type: ErrorType,
    readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

export class NotFoundError extends AppError {
  constructor(code: string, message: string) {
    super(404, 'not_found', code, message)
  }
}

export class ConflictError extends AppError {
  constructor(code: string, message: string) {
    super(409, 'conflict', code, message)
  }
}
