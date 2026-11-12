import { MIN_WORD_LENGTH, STOP_WORDS } from './kb.config.js'

export function tokenize(subject: string, body: string): Set<string> {
  const words = (subject + ' ' + body).toLowerCase().split(/[^a-z0-9]+/)
  return new Set(words.filter((word) => word.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(word)))
}

// Jaccard similarity: common words divided by all different words of both texts.
export function jaccard(a: Set<string>, b: Set<string>): number {
  let common = 0
  for (const word of a) {
    if (b.has(word)) {
      common += 1
    }
  }
  const total = a.size + b.size - common
  return total === 0 ? 0 : common / total
}
