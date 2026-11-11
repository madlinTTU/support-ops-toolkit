-- Up Migration
CREATE TABLE tickets (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subject text NOT NULL,
  body text NOT NULL,
  customer_email text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('email', 'chat', 'web_form')),
  category text,
  priority text CHECK (priority IN ('critical', 'high', 'normal', 'low')),
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'queued', 'in_progress', 'closed')),
  escalated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL,
  triaged_at timestamptz,
  sla_due_at timestamptz,
  first_response_at timestamptz,
  closed_at timestamptz,
  escalated_at timestamptz,
  resolution text,
  kb_candidate_id integer REFERENCES kb_candidates (id)
);

-- Down Migration
DROP TABLE tickets;
