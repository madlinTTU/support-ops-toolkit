import { MIN_GROUP_SIZE, SIMILARITY_THRESHOLD } from './kb.config.js'
import { jaccard, tokenize } from './similarity.js'

export interface ClosedTicket {
  id: number
  category: string
  subject: string
  body: string
  createdAt: Date
  kbCandidateId: number | null
}

export interface RecurringGroup {
  category: string
  representativeSubject: string
  representativeBody: string
  tickets: ClosedTicket[]
}

interface Item {
  ticket: ClosedTicket
  words: Set<string>
}

// Finds the problems that keep coming back: groups of similar closed tickets, each group has 3 or more tickets.
// 1. Split the tickets by category, tickets from different categories are never compared.
// 2. Inside a category, merge similar tickets into groups.
// 3. Keep the groups with at least MIN_GROUP_SIZE tickets and pick the most typical subject for each one.
export function findRecurringGroups(tickets: ClosedTicket[]): RecurringGroup[] {
  const itemsByCategory = new Map<string, Item[]>()
  for (const ticket of tickets) {
    const item = { ticket, words: tokenize(ticket.subject, ticket.body) }
    itemsByCategory.set(ticket.category, [...(itemsByCategory.get(ticket.category) ?? []), item])
  }

  const result: RecurringGroup[] = []
  for (const entry of itemsByCategory) {
    const category = entry[0]
    const items = entry[1]
    const groups = mergeSimilar(items)
    const bigGroups = groups.filter((group) => group.length >= MIN_GROUP_SIZE)
    for (const group of bigGroups) {
      const typical = pickMostTypical(group).ticket
      result.push({
        category,
        representativeSubject: typical.subject,
        representativeBody: typical.body,
        tickets: group.map((item) => item.ticket).sort((a, b) => a.id - b.id),
      })
    }
  }
  return result
}

// Adds the tickets one by one. A new ticket joins every group where it is similar to at least one member, so those groups become one.
function mergeSimilar(items: Item[]): Item[][] {
  let groups: Item[][] = []
  for (const item of items) {
    const newGroup = [item]
    const untouchedGroups: Item[][] = []
    for (const group of groups) {
      if (group.some((other) => jaccard(other.words, item.words) >= SIMILARITY_THRESHOLD)) {
        newGroup.push(...group)
      } else {
        untouchedGroups.push(group)
      }
    }
    untouchedGroups.push(newGroup)
    groups = untouchedGroups
  }
  return groups
}

// The most typical ticket is the one most similar to all the others in its group.
function pickMostTypical(group: Item[]): Item {
  let best = group[0]
  let bestScore = -1
  for (const item of group) {
    let score = 0
    for (const other of group) {
      score += jaccard(item.words, other.words)
    }
    if (score > bestScore) {
      best = item
      bestScore = score
    }
  }
  return best
}
