import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { TriageService } from '../triage/triage.service.js'
import { SlaService } from './sla.service.js'

@Injectable()
export class SlaScheduler {
  constructor(
    private readonly triageService: TriageService,
    private readonly slaService: SlaService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async run(): Promise<void> {
    await this.triageService.triageNewTickets()
    await this.slaService.escalateAtRiskTickets()
  }
}
