export const TICKET_CATEGORIES = ['account_access', 'billing', 'data_change', 'bug', 'how_to', 'other'] as const
export const TICKET_PRIORITIES = ['critical', 'high', 'normal', 'low'] as const
export const TICKET_STATUSES = ['new', 'queued', 'in_progress', 'closed'] as const
export const TICKET_CHANNELS = ['email', 'chat', 'web_form'] as const

export type TicketCategory = (typeof TICKET_CATEGORIES)[number]
export type TicketPriority = (typeof TICKET_PRIORITIES)[number]
export type TicketStatus = (typeof TICKET_STATUSES)[number]
export type TicketChannel = (typeof TICKET_CHANNELS)[number]
