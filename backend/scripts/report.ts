import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { AnalyticsService } from '../src/analytics/analytics.service.js'
import { ReportService } from '../src/reports/report.service.js'

const ENV_FILE = fileURLToPath(new URL('../.env', import.meta.url))
const REPORTS_DIR = fileURLToPath(new URL('../reports/', import.meta.url))

async function main(): Promise<void> {
  if (existsSync(ENV_FILE)) {
    process.loadEnvFile(ENV_FILE)
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  try {
    const now = new Date()
    const report = await new ReportService(pool, new AnalyticsService(pool)).generate(now)

    await mkdir(REPORTS_DIR, { recursive: true })
    const file = REPORTS_DIR + 'daily-report-' + now.toISOString().slice(0, 10) + '.txt'
    await writeFile(file, report)

    console.log(report)
    console.log('Saved to ' + file)
  } finally {
    await pool.end()
  }
}

await main()
