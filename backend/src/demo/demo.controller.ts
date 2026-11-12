import { Controller, HttpCode, Post } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiErrorResponses } from '../web/api-error-responses.js'
import { DemoResetService } from './demo-reset.service.js'
import { ResetResultResponse } from './dto/demo-response.dto.js'

@ApiTags('demo')
@Controller('demo')
export class DemoController {
  constructor(private readonly demoResetService: DemoResetService) {}

  @Post('reset')
  @HttpCode(200)
  @ApiOperation({ summary: 'Erase all tickets and candidates and create a new set' })
  @ApiOkResponse({ type: ResetResultResponse })
  @ApiErrorResponses(409, 429)
  reset(): Promise<ResetResultResponse> {
    return this.demoResetService.reset()
  }
}
