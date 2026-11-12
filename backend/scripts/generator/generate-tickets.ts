import { faker } from '@faker-js/faker'
import { SLA_HOURS } from '../../src/sla/sla.constants.js'
import type { TicketCategory, TicketChannel, TicketPriority, TicketStatus } from '../../src/tickets/ticket.types.js'
import { ONE_OFF_TEMPLATES, RECURRING_TEMPLATES } from './issue-templates.js'
import type { IssueTemplate } from './issue-templates.js'

export interface GenerateOptions {
  count: number
  seed: number
  now: Date
}

export interface GeneratedTicket {
  subject: string
  body: string
  customerEmail: string
  channel: TicketChannel
  status: TicketStatus
  createdAt: Date
  firstResponseAt: Date | null
  closedAt: Date | null
  resolution: string | null
  issueType: string
  expectedCategory: TicketCategory
  expectedPriority: TicketPriority
}

export const DEFAULT_COUNT = 500
export const DEFAULT_SEED = 42
export const PERIOD_DAYS = 30

// One-off tickets are noise: they appear once and must not become knowledge-base candidates.
const MAX_ONE_OFF_TICKETS = 8
const CUSTOMER_POOL_SIZE = 120
// A share of tickets is handled slowly (SLOW_FACTOR times longer), so some of them miss their SLA.
const SLOW_SHARE = 0.3
const SLOW_FACTOR = 2.5
// Vague wording has no obvious keywords, so keyword-based triage is expected to miss some tickets.
const VAGUE_SHARE = 0.15
const EXTRA_SENTENCE_SHARE = 0.5
// JavaScript dates are in milliseconds.
const HOUR_MS = 3_600_000

// Weights are relative: 50/30/20 means about half of the tickets arrive by email.
const CHANNELS: { value: TicketChannel; weight: number }[] = [
  { value: 'email', weight: 50 },
  { value: 'web_form', weight: 30 },
  { value: 'chat', weight: 20 },
]

// Time from the first response to the closing, by priority. SLA_HOURS only limits the first response.
const RESOLUTION_BASE_HOURS: Record<TicketPriority, number> = {
  critical: 12,
  high: 36,
  normal: 96,
  low: 144,
}

export function generateTickets({ count, seed, now }: GenerateOptions): GeneratedTicket[] {
  faker.seed(seed)
  const oneOffCount = Math.min(MAX_ONE_OFF_TICKETS, Math.floor(count / 10))
  const templates: IssueTemplate[] = ONE_OFF_TEMPLATES.slice(0, oneOffCount)
  const recurringChoices = RECURRING_TEMPLATES.map((template) => ({ weight: template.weight, value: template }))
  while (templates.length < count) {
    templates.push(faker.helpers.weightedArrayElement(recurringChoices))
  }
  return (
    templates.map((template) => buildTicket(template, now))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  )
}

function buildTicket(template: IssueTemplate, now: Date): GeneratedTicket {
  // For some issue types a share of tickets uses vague wording instead of the normal wording.
  const vague = template.vague && faker.datatype.boolean({ probability: VAGUE_SHARE }) ? template.vague : null
  const source = vague ?? template
  const subject = faker.helpers.arrayElement(source.subjects)
  // Vague tickets get no extra sentences, so no keyword sneaks back in.
  const body = buildBody(faker.helpers.arrayElement(source.bodies), vague ? [] : template.extras)
  const createdAt = faker.date.recent({ days: PERIOD_DAYS, refDate: now })
  const agent = simulateAgent(template.priority, createdAt, now)
  const channel = faker.helpers.weightedArrayElement(CHANNELS)
  const customerNumber = String(faker.number.int({ min: 1, max: CUSTOMER_POOL_SIZE }))
  return {
    subject,
    body,
    customerEmail: 'customer-' + customerNumber + '@example.com',
    channel,
    createdAt,
    status: agent.status,
    firstResponseAt: agent.firstResponseAt,
    closedAt: agent.closedAt,
    resolution: agent.status === 'closed' ? faker.helpers.arrayElement(template.resolutions) : null,
    // The three fields below are not saved to the database. Tests and later triage checks use them as the correct answer.
    issueType: template.id,
    expectedCategory: template.category,
    expectedPriority: template.priority,
  }
}

function buildBody(text: string, extras: string[]): string {
  if (extras.length > 0 && faker.datatype.boolean({ probability: EXTRA_SENTENCE_SHARE })) {
    return text + ' ' + faker.helpers.arrayElement(extras)
  }
  return text
}

// Simulates a human agent: when the first reply happens and when the ticket is closed.
// If a moment is still in the future, the ticket has not got that far yet and stays open.
function simulateAgent(priority: TicketPriority, createdAt: Date, now: Date) {
  const slowFactor = faker.datatype.boolean({ probability: SLOW_SHARE }) ? SLOW_FACTOR : 1
  const firstResponseHours = SLA_HOURS[priority] * faker.number.float({ min: 0.1, max: 0.9 }) * slowFactor
  const resolutionHours = RESOLUTION_BASE_HOURS[priority] * faker.number.float({ min: 0.5, max: 1.5 }) * slowFactor
  const firstResponseAt = new Date(createdAt.getTime() + firstResponseHours * HOUR_MS)
  const closedAt = new Date(firstResponseAt.getTime() + resolutionHours * HOUR_MS)

  if (closedAt <= now) {
    return { status: 'closed' as const, firstResponseAt, closedAt }
  }
  if (firstResponseAt <= now) {
    return { status: 'in_progress' as const, firstResponseAt, closedAt: null }
  }
  return { status: 'queued' as const, firstResponseAt: null, closedAt: null }
}
