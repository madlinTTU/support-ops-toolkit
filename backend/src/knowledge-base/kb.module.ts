import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module.js'
import { KbCandidatesController } from './kb-candidates.controller.js'
import { KbCandidatesService } from './kb-candidates.service.js'
import { KbService } from './kb.service.js'

@Module({
  imports: [DatabaseModule],
  controllers: [KbCandidatesController],
  providers: [KbService, KbCandidatesService],
  exports: [KbService],
})
export class KbModule {}
