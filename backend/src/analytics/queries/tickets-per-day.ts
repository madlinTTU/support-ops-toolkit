// $1 is today (YYYY-MM-DD).
export const TICKETS_PER_DAY = `
  SELECT 
      to_char(day, 'YYYY-MM-DD') AS day, 
      count(tickets.id)::int AS "ticketCount"
  FROM generate_series($1::timestamp - interval '29 days', $1::timestamp, interval '1 day') AS day
  LEFT JOIN tickets ON (tickets.created_at AT TIME ZONE 'UTC')::date = day::date
  GROUP BY day
  ORDER BY day
`
