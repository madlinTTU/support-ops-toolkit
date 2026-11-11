-- Up Migration
CREATE INDEX tickets_status_idx ON tickets (status);
CREATE INDEX tickets_category_idx ON tickets (category);
CREATE INDEX tickets_created_at_idx ON tickets (created_at);
CREATE INDEX tickets_sla_due_at_idx ON tickets (sla_due_at);

-- Down Migration
DROP INDEX tickets_sla_due_at_idx;
DROP INDEX tickets_created_at_idx;
DROP INDEX tickets_category_idx;
DROP INDEX tickets_status_idx;
