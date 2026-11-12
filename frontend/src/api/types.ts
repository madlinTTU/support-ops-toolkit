export const TICKET_STATUSES = ['new', 'queued', 'in_progress', 'closed'] as const
export const TICKET_CATEGORIES = ['account_access', 'billing', 'data_change', 'bug', 'how_to', 'other'] as const

export const KB_CANDIDATE_STATUSES = ['proposed', 'accepted', 'dismissed'] as const

export type KbCandidateStatus = (typeof KB_CANDIDATE_STATUSES)[number]
export type TicketStatus = (typeof TICKET_STATUSES)[number]
export type TicketCategory = (typeof TICKET_CATEGORIES)[number]
export type TicketPriority = 'critical' | 'high' | 'normal' | 'low'
export type TicketChannel = 'email' | 'chat' | 'web_form'
export type KbDecision = 'accepted' | 'dismissed'

export interface Ticket {
  id: number
  subject: string
  body: string
  customerEmail: string
  channel: TicketChannel
  category: TicketCategory | null
  priority: TicketPriority | null
  tags: string[]
  status: TicketStatus
  escalated: boolean
  createdAt: string
  triagedAt: string | null
  slaDueAt: string | null
  firstResponseAt: string | null
  closedAt: string | null
  escalatedAt: string | null
  resolution: string | null
  minutesLeft: number | null
}

export interface Summary {
  openCount: number
  escalatedCount: number
  closedCount: number
  onTimeCount: number
  onTimePercent: number
}

export interface KbCandidate {
  id: number
  category: string
  subject: string
  exampleText: string
  ticketCount: number
  status: KbCandidateStatus
  firstSeenAt: string
  lastSeenAt: string
}

export interface TicketFilters {
  status: TicketStatus | 'all'
  category: TicketCategory | 'all'
}

export interface TicketQuery extends TicketFilters {
  search: string
}

export interface VolumeByCategory {
  category: string
  ticketCount: number
  percent: number
}

export interface TicketsPerDay {
  day: string
  ticketCount: number
}

export interface ResponseTimes {
  priority: TicketPriority
  ticketCount: number
  averageMinutes: number
  medianMinutes: number
  p90Minutes: number
}

export interface TopRecurring {
  id: number
  category: string
  subject: string
  ticketCount: number
}

export interface KbCandidateQuery {
  category: TicketCategory | 'all'
  status: KbCandidateStatus | 'all'
  search: string
}

export interface ApiErrorBody {
  type: string
  message: string
  code: string
}
