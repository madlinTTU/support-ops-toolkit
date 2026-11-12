import { Inject, Injectable } from '@nestjs/common'
import pg from 'pg'
import { PG_POOL } from '../database/database.module.js'
import { AT_RISK_SHARE } from './sla.constants.js'

// $1 now, $2 at-risk share. "Time left < 25% of the whole window"
const ESCALATE_AT_RISK = `
  UPDATE tickets
  SET escalated = true, escalated_at = $1::timestamptz
  WHERE status <> 'closed' AND escalated = false AND sla_due_at IS NOT NULL
    AND sla_due_at - $1::timestamptz < (sla_due_at - created_at) * $2::float8
`

@Injectable()
export class SlaService {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  async escalateAtRiskTickets(now: Date = new Date()): Promise<number> {
    const result = await this.pool.query(ESCALATE_AT_RISK, [now, AT_RISK_SHARE])
    return result.rowCount ?? 0
  }
}
