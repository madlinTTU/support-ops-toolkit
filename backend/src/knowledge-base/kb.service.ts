import { Inject, Injectable } from '@nestjs/common'
import pg from 'pg'
import { PG_POOL } from '../database/database.module.js'
import { findRecurringGroups } from './recurring.js'
import type { ClosedTicket, RecurringGroup } from './recurring.js'

const SELECT_CLOSED = `
  SELECT id, category, subject, body, created_at AS "createdAt", kb_candidate_id AS "kbCandidateId"
  FROM tickets
  WHERE status = 'closed' AND category IS NOT NULL
  ORDER BY id
`
const INSERT_CANDIDATE = `
  INSERT INTO kb_candidates (category, representative_subject, ticket_count, first_seen_at, last_seen_at,
                             representative_body)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING id
`

const UPDATE_CANDIDATE = `
  UPDATE kb_candidates
  SET category = $1, representative_subject = $2, ticket_count = $3, first_seen_at = $4, last_seen_at = $5,
      representative_body = $6
  WHERE id = $7
`

const LINK_TICKETS = 'UPDATE tickets SET kb_candidate_id = $1 WHERE id = ANY($2)'

@Injectable()
export class KbService {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  async detectCandidates(): Promise<number> {
    const { rows } = await this.pool.query<ClosedTicket>(SELECT_CLOSED)
    const groups = findRecurringGroups(rows)

    // transaction
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      // A candidate that is already used by one group cannot be used by another one in the same run.
      const usedCandidateIds = new Set<number>()
      for (const group of groups) {
        const candidateId = await this.saveCandidate(client, group, usedCandidateIds)
        usedCandidateIds.add(candidateId)
        await client.query(LINK_TICKETS, [candidateId, group.tickets.map((ticket) => ticket.id)])
      }
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
    return groups.length
  }

  // Updates the candidate this group already has, or creates a new one. Returns the candidate id.
  private async saveCandidate(
    client: pg.PoolClient,
    group: RecurringGroup,
    usedCandidateIds: Set<number>,
  ): Promise<number> {
    const times = group.tickets.map((ticket) => ticket.createdAt.getTime())
    const values = [
      group.category,
      group.representativeSubject,
      group.tickets.length,
      new Date(Math.min(...times)),
      new Date(Math.max(...times)),
      group.representativeBody,
    ]

    const existingId = findExistingCandidateId(group, usedCandidateIds)
    if (existingId === null) {
      const inserted = await client.query<{ id: number }>(INSERT_CANDIDATE, values)
      return inserted.rows[0].id
    }
    await client.query(UPDATE_CANDIDATE, [...values, existingId])
    return existingId
  }
}

// A ticket that already has a candidate shows which candidate this group is.
function findExistingCandidateId(group: RecurringGroup, usedCandidateIds: Set<number>): number | null {
  for (const ticket of group.tickets) {
    const id = ticket.kbCandidateId
    if (id !== null && !usedCandidateIds.has(id)) {
      return id
    }
  }
  return null
}
