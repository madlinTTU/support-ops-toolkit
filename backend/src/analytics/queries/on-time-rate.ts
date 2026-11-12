export const ON_TIME_RATE = `
  SELECT priority,
         count(*)::int AS "closedCount",
         (count(*) FILTER (WHERE closed_at <= sla_due_at))::int AS "onTimeCount"
  FROM tickets
  WHERE status = 'closed' AND closed_at IS NOT NULL AND sla_due_at IS NOT NULL
  GROUP BY priority
  ORDER BY array_position(ARRAY['critical', 'high', 'normal', 'low'], priority)
`
