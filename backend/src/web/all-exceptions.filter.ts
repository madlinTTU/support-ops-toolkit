import { Catch, Logger } from '@nestjs/common'
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import type { Response } from 'express'
import { AppError } from './app-error.js'
import { toErrorResult } from './to-error-response.js'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const result = toErrorResult(exception)
    if (result.status === 500 && !(exception instanceof AppError)) {
      this.logger.error(exception)
    }
    host.switchToHttp().getResponse<Response>().status(result.status).json(result.body)
  }
}
