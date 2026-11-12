import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module.js'
import { KbService } from './kb.service.js'

@Module({
  imports: [DatabaseModule],
  providers: [KbService],
  exports: [KbService],
})
export class KbModule {}
