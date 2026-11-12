import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiErrorResponses } from '../web/api-error-responses.js'
import { KbCandidateResponse, UpdateKbCandidateBody } from './dto/kb-candidate.dto.js'
import { ListKbCandidatesQuery } from './dto/list-kb-candidates-query.dto.js'
import { KbCandidatesService } from './kb-candidates.service.js'

@ApiTags('kb-candidates')
@Controller('kb-candidates')
export class KbCandidatesController {
  constructor(private readonly kbCandidatesService: KbCandidatesService) {}

  @Get()
  @ApiOperation({ summary: 'List knowledge-base candidates, the ones with the most tickets first' })
  @ApiOkResponse({ type: [KbCandidateResponse] })
  @ApiErrorResponses(400)
  list(@Query() query: ListKbCandidatesQuery): Promise<KbCandidateResponse[]> {
    return this.kbCandidatesService.list(query)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Accept or dismiss a candidate' })
  @ApiOkResponse({ type: KbCandidateResponse })
  @ApiErrorResponses(400, 404)
  decide(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateKbCandidateBody): Promise<KbCandidateResponse> {
    return this.kbCandidatesService.decide(id, body.status)
  }
}
