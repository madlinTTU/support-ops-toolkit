import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { DemoDataService } from '../src/demo/demo-data.service.js'
import { DEFAULT_SEED, PERIOD_DAYS } from '../src/demo/generator/generate-tickets.js'
import { KbService } from '../src/knowledge-base/kb.service.js'
import { SlaService } from '../src/sla/sla.service.js'
import { TriageService } from '../src/triage/triage.service.js'

const ENV_FILE = fileURLToPath(new URL('../.env', import.meta.url))

async function main(): Promise<void> {
  if (existsSync(ENV_FILE)) {
    process.loadEnvFile(ENV_FILE)
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  try {
    const demoData = new DemoDataService(pool, new TriageService(pool), new SlaService(pool), new KbService(pool))
    // The seed script is repeatable: the same data every time. The reset button uses a random seed.
    const result = await demoData.regenerate(new Date(), DEFAULT_SEED)
    console.log('Removed ' + result.removedTickets + ' earlier generated tickets.')
    console.log(
      'Inserted ' +
        result.createdTickets +
        ' tickets over the last ' +
        PERIOD_DAYS +
        ' days (seed ' +
        result.seed +
        ').',
    )
    console.log('Triaged ' + result.triagedTickets + ', escalated ' + result.escalatedTickets + ' at-risk tickets.')
    console.log('Found ' + result.candidates + ' knowledge-base candidates.')
  } finally {
    await pool.end()
  }
}

await main()
