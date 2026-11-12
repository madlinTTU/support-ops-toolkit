export const RESPONSE_TIMES = `
  SELECT priority,
         count(*)::int AS "ticketCount",
         avg(minutes)::float8 AS "averageMinutes",
         percentile_cont(0.5) WITHIN GROUP (ORDER BY minutes) AS "medianMinutes",
         percentile_cont(0.9) WITHIN GROUP (ORDER BY minutes) AS "p90Minutes"
  FROM (
    SELECT priority, EXTRACT(EPOCH FROM (first_response_at - created_at)) / 60 AS minutes
    FROM tickets
    WHERE first_response_at IS NOT NULL AND priority IS NOT NULL
  ) AS response
  GROUP BY priority
  ORDER BY array_position(ARRAY['critical', 'high', 'normal', 'low'], priority)
`
