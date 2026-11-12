import { Inject, Injectable } from '@nestjs/common'
import pg from 'pg'
import { PG_POOL } from '../database/database.module.js'
import { toSearchPattern } from '../search/search.js'
import { NotFoundError } from '../web/app-error.js'
import type { KbCandidateResponse, KbDecision } from './dto/kb-candidate.dto.js'
import type { ListKbCandidatesQuery } from './dto/list-kb-candidates-query.dto.js'

const CANDIDATE_COLUMNS = `
  id, category, representative_subject AS subject, representative_body AS "exampleText",
  ticket_count AS "ticketCount", status,
  first_seen_at AS "firstSeenAt", last_seen_at AS "lastSeenAt"
`

// $1 search pattern (see toSearchPattern), $2 category, $3 status. A filter that is null is ignored.
const SELECT_CANDIDATES = `
  SELECT ${CANDIDATE_COLUMNS}
  FROM kb_candidates
  WHERE ($1::text IS NULL OR representative_subject ILIKE $1 OR representative_body ILIKE $1)
    AND ($2::text IS NULL OR category = $2)
    AND ($3::text IS NULL OR status = $3)
  ORDER BY ticket_count DESC, id
`

const UPDATE_STATUS = `UPDATE kb_candidates SET status = $2 WHERE id = $1::bigint RETURNING ${CANDIDATE_COLUMNS}`

@Injectable()
export class KbCandidatesService {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  async list(query: ListKbCandidatesQuery): Promise<KbCandidateResponse[]> {
    const result = await this.pool.query<KbCandidateResponse>(SELECT_CANDIDATES, [
      toSearchPattern(query.search),
      query.category ?? null,
      query.status ?? null,
    ])
    return result.rows
  }

  async decide(id: number, status: KbDecision): Promise<KbCandidateResponse> {
    const result = await this.pool.query<KbCandidateResponse>(UPDATE_STATUS, [id, status])
    const candidate = result.rows[0]
    if (candidate === undefined) {
      throw new NotFoundError('KB_CANDIDATE_NOT_FOUND', `Knowledge-base candidate ${id} does not exist`)
    }
    return candidate
  }
}
