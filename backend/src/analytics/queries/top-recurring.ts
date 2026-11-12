export const TOP_RECURRING = `
  SELECT id, category, representative_subject AS subject, ticket_count AS "ticketCount"
  FROM kb_candidates
  ORDER BY ticket_count DESC, id
  LIMIT 10
`
