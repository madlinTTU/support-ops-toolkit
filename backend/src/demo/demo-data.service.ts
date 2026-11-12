import { randomInt } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'
import pg from 'pg'
import { PG_POOL } from '../database/database.module.js'
import { KbService } from '../knowledge-base/kb.service.js'
import { SlaService } from '../sla/sla.service.js'
import { TriageService } from '../triage/triage.service.js'
import { DEFAULT_COUNT, generateTickets } from './generator/generate-tickets.js'

const MAX_SEED = 2 ** 31

const DELETE_TICKETS = 'DELETE FROM tickets'
const DELETE_CANDIDATES = 'DELETE FROM kb_candidates'
const INSERT_TICKET = `
  INSERT INTO tickets (subject, body, customer_email, channel, status, created_at, first_response_at, closed_at, resolution)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
`

export interface RegenerateResult {
  seed: number
  removedTickets: number
  createdTickets: number
  triagedTickets: number
  escalatedTickets: number
  candidates: number
}

// Replaces the generated data with a new set and runs the same steps that the scheduler runs later,
// so the new data is ready to use at once. The same seed gives the same tickets; by default the seed is random,
// so every reset gives different numbers.
@Injectable()
export class DemoDataService {
  constructor(
    @Inject(PG_POOL) private readonly pool: pg.Pool,
    private readonly triageService: TriageService,
    private readonly slaService: SlaService,
    private readonly kbService: KbService,
  ) {}

  async regenerate(now: Date = new Date(), seed: number = randomInt(MAX_SEED)): Promise<RegenerateResult> {
    const tickets = generateTickets({ count: DEFAULT_COUNT, seed, now })
    const client = await this.pool.connect()
    let removedTickets = 0
    try {
      await client.query('BEGIN')
      const removed = await client.query(DELETE_TICKETS)
      removedTickets = removed.rowCount ?? 0
      await client.query(DELETE_CANDIDATES)
      for (const ticket of tickets) {
        await client.query(INSERT_TICKET, [
          ticket.subject,
          ticket.body,
          ticket.customerEmail,
          ticket.channel,
          ticket.status,
          ticket.createdAt,
          ticket.firstResponseAt,
          ticket.closedAt,
          ticket.resolution,
        ])
      }
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

    const triagedTickets = await this.triageService.triageNewTickets()
    const escalatedTickets = await this.slaService.escalateAtRiskTickets(now)
    const candidates = await this.kbService.detectCandidates()
    return { seed, removedTickets, createdTickets: tickets.length, triagedTickets, escalatedTickets, candidates }
  }
}
