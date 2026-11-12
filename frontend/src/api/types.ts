export const TICKET_STATUSES = ['new', 'queued', 'in_progress', 'closed'] as const
export const TICKET_CATEGORIES = ['account_access', 'billing', 'data_change', 'bug', 'how_to', 'other'] as const

export type TicketStatus = (typeof TICKET_STATUSES)[number]
export type TicketCategory = (typeof TICKET_CATEGORIES)[number]
export type TicketPriority = 'critical' | 'high' | 'normal' | 'low'
export type TicketChannel = 'email' | 'chat' | 'web_form'
export type KbCandidateStatus = 'proposed' | 'accepted' | 'dismissed'
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

export interface ApiErrorBody {
  type: string
  message: string
  code: string
}
