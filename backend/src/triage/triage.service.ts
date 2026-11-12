import { Inject, Injectable } from '@nestjs/common'
import pg from 'pg'
import { PG_POOL } from '../database/database.module.js'
import { triageTicket } from './triage.js'

interface UntriagedTicket {
  id: number
  subject: string
  body: string
}

const SELECT_UNTRIAGED = 'SELECT id, subject, body FROM tickets WHERE category IS NULL ORDER BY id'

// $1 category, $2 priority, $3 tags, $4 id
const UPDATE_TRIAGED = `
  UPDATE tickets
  SET category = $1, priority = $2, tags = $3, triaged_at = now(),
      status = CASE
          	WHEN status = 'new' THEN 'queued' 
          	ELSE status END
  WHERE id = $4 AND category IS NULL
`

@Injectable()
export class TriageService {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  async triageNewTickets(): Promise<number> {
    const { rows } = await this.pool.query<UntriagedTicket>(SELECT_UNTRIAGED)
    for (const row of rows) {
      const result = triageTicket(row.subject, row.body)
      await this.pool.query(UPDATE_TRIAGED, [result.category, result.priority, result.tags, row.id])
    }
    return rows.length
  }
}
