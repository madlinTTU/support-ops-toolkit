import { Injectable } from '@nestjs/common'
import { ConflictError, TooManyRequestsError } from '../web/app-error.js'
import { RESET_COOLDOWN_MS } from './demo.config.js'
import { DemoDataService } from './demo-data.service.js'
import type { RegenerateResult } from './demo-data.service.js'

// The rules of the reset button: one reset at a time, not too often.
@Injectable()
export class DemoResetService {
  private lastResetAt: Date | null = null
  private running = false

  constructor(private readonly demoDataService: DemoDataService) {}

  async reset(now: Date = new Date()): Promise<RegenerateResult> {
    if (this.running) {
      throw new ConflictError('RESET_IN_PROGRESS', 'A reset is already running')
    }
    const secondsToWait = this.secondsToWait(now)
    if (secondsToWait > 0) {
      throw new TooManyRequestsError(
        'RESET_TOO_SOON',
        `The data was reset a moment ago. Wait ${secondsToWait} seconds.`,
      )
    }

    this.running = true
    try {
      const result = await this.demoDataService.regenerate(now)
      this.lastResetAt = now
      return result
    } finally {
      this.running = false
    }
  }

  private secondsToWait(now: Date): number {
    if (this.lastResetAt === null) {
      return 0
    }
    const leftMs = RESET_COOLDOWN_MS - (now.getTime() - this.lastResetAt.getTime())
    return Math.max(0, Math.ceil(leftMs / 1000))
  }
}
