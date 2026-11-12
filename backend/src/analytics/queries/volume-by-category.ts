// $1 is today (YYYY-MM-DD).
export const VOLUME_BY_CATEGORY = `
  SELECT COALESCE(category, 'untriaged') AS category,
         count(*)::int AS "ticketCount",
         round(100.0 * count(*) / sum(count(*)) OVER (), 1)::float8 AS percent
  FROM tickets
  WHERE (created_at AT TIME ZONE 'UTC')::date BETWEEN $1::date - 29 AND $1::date
  GROUP BY COALESCE(category, 'untriaged')
  ORDER BY "ticketCount" DESC, category
`
