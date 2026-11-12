import { Inject, Injectable } from '@nestjs/common'
import pg from 'pg'
import { PG_POOL } from '../database/database.module.js'
import { calculateDueAt } from '../sla/sla.js'
import { triageTicket } from './triage.js'

interface UntriagedTicket {
  id: number
  subject: string
  body: string
  createdAt: Date
}

const SELECT_UNTRIAGED =
  'SELECT id, subject, body, created_at AS "createdAt" FROM tickets WHERE category IS NULL ORDER BY id'

// $1 category, $2 priority, $3 tags, $4 deadline, $5 id
const UPDATE_TRIAGED = `
  UPDATE tickets
  SET category = $1, priority = $2, tags = $3, sla_due_at = $4, triaged_at = now(),
      status = CASE
          	WHEN status = 'new' THEN 'queued' 
          	ELSE status END
  WHERE id = $5 AND category IS NULL
`

@Injectable()
export class TriageService {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  async triageNewTickets(): Promise<number> {
    const { rows } = await this.pool.query<UntriagedTicket>(SELECT_UNTRIAGED)
    for (const row of rows) {
      const result = triageTicket(row.subject, row.body)
      await this.pool.query(UPDATE_TRIAGED, [
        result.category,
        result.priority,
        result.tags,
        calculateDueAt(row.createdAt, result.priority),
        row.id,
      ])
    }
    return rows.length
  }
}
