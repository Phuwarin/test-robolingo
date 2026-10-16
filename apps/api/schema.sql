CREATE TABLE IF NOT EXISTS line_users (
 id text PRIMARY KEY,
 name text NOT NULL,
 last_message_id text,
 picture_url text,
 friend_status text NOT NULL DEFAULT 'unknown',
 friend_status_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS messages (
 id text PRIMARY KEY,
 line_user_id text NOT NULL REFERENCES line_users(id),
 direction text NOT NULL CHECK (direction IN ('received','botSent')),
 body text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now(),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_user_time ON messages(line_user_id,created_at);
