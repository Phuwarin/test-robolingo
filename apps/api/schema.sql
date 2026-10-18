CREATE TABLE IF NOT EXISTS line_users (
 id text PRIMARY KEY,
 line_user_id text NOT NULL UNIQUE,
 name text NOT NULL,
 unread_count integer NOT NULL DEFAULT 0,
 last_message_id text,
 last_message_time timestamptz,
 picture_url text,
 friend_status text NOT NULL DEFAULT 'unknown',
 friend_status_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS messages (
 id text PRIMARY KEY,
 line_message_id text UNIQUE,
 read_at timestamptz,
 line_user_id text NOT NULL REFERENCES line_users(id),
 direction text NOT NULL CHECK (direction IN ('received','botSent')),
 body text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now(),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_user_time ON messages(line_user_id,created_at);
