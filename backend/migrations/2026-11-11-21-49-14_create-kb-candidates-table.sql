-- Up Migration
CREATE TABLE kb_candidates (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category text NOT NULL,
  representative_subject text NOT NULL,
  ticket_count integer NOT NULL CHECK (ticket_count > 0),
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'dismissed')),
  first_seen_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL
);

-- Down Migration
DROP TABLE kb_candidates;
