CREATE TABLE IF NOT EXISTS contacts (
 id text PRIMARY KEY,
 name text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS messages (
 id text PRIMARY KEY,
 contact_id text NOT NULL REFERENCES contacts(id),
 direction text NOT NULL CHECK (direction IN ('in','out')),
 body text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_contact_time ON messages(contact_id, created_at);
