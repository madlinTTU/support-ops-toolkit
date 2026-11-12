import type { TicketCategory, TicketPriority } from '../tickets/ticket.types.js'
import { CATEGORY_RULES, CRITICAL_WORDS, SUBJECT_WEIGHT, URGENT_WORDS } from './triage.config.js'

export interface TriageResult {
  category: TicketCategory
  priority: TicketPriority
  tags: string[]
}

export function triageTicket(subject: string, body: string): TriageResult {
  const subjectText = subject.toLowerCase()
  const bodyText = body.toLowerCase()
  const matched = new Set<string>()

  let category: TicketCategory = 'other'
  let bestScore = 0
  for (const rule of CATEGORY_RULES) {
    let score = 0
    for (const keyword of rule.keywords) {
      const inSubject = subjectText.includes(keyword)
      const inBody = bodyText.includes(keyword)
      if (inSubject) {
        score += SUBJECT_WEIGHT
      }
      if (inBody) {
        score += 1
      }
      if (inSubject || inBody) {
        matched.add(keyword)
      }
    }
    if (score > bestScore) {
      bestScore = score
      category = rule.category
    }
  }

  const fullText = subjectText + ' ' + bodyText
  return { category, priority: pickPriority(fullText, category), tags: [...matched] }
}

function pickPriority(text: string, category: TicketCategory): TicketPriority {
  if (CRITICAL_WORDS.some((word) => text.includes(word))) {
    return 'critical'
  }
  if (URGENT_WORDS.some((word) => text.includes(word))) {
    return 'high'
  }
  if (category === 'how_to') {
    return 'low'
  }
  return 'normal'
}
