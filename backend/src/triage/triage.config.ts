import type { TicketCategory } from '../tickets/ticket.types.js'

// A keyword found in the subject counts this many times, a keyword found in the body counts once.
export const SUBJECT_WEIGHT = 2

// The order matters: when two categories have the same score, the one listed first wins.
export const CATEGORY_RULES: { category: TicketCategory; keywords: string[] }[] = [
  {
    category: 'account_access',
    keywords: [
      'password',
      'reset link',
      'sign in',
      'log in',
      'locked',
      'two-factor',
      '2fa',
      'authenticator',
      'verification code',
      'hacked',
      'sign-in',
      'unlock',
      'username',
      'access denied',
    ],
  },
  {
    category: 'billing',
    keywords: [
      'invoice',
      'refund',
      'charge',
      'payment',
      'subscription',
      'billing',
      'currency',
      'card',
      'receipt',
      'billed',
      'overcharged',
    ],
  },
  {
    category: 'data_change',
    keywords: [
      'change email',
      'change the email',
      'update email',
      'update the email',
      'login email',
      'email address',
      'delete',
      'personal data',
      'gdpr',
      'rename',
      'erase',
    ],
  },
  {
    category: 'bug',
    keywords: [
      'error',
      'crash',
      'broken',
      'not working',
      'fails',
      'blank',
      'loading',
      'exception',
      'stuck',
      'freezes',
      'timeout',
      'something went wrong',
    ],
  },
  {
    category: 'how_to',
    keywords: [
      'how do i',
      'how to',
      'how can i',
      'where can i',
      'where to',
      'guide',
      'explain',
      'tutorial',
      'documentation',
      'instructions',
      'is there a way',
    ],
  },
]

// Checked first. One of these makes the ticket critical.
export const CRITICAL_WORDS = [
  'fraud',
  'hacked',
  'charged twice',
  'duplicate payment',
  'unauthorized',
  'data breach',
  'stolen',
]

// Checked second. One of these makes the ticket high.
export const URGENT_WORDS = [
  'urgent',
  'asap',
  'locked out',
  'cannot sign in',
  'as soon as possible',
  'blocking',
  'immediately',
  'right now',
  'deadline',
]
