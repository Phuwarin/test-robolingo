ALTER TABLE contacts ADD COLUMN IF NOT EXISTS picture_url text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS friend_status text NOT NULL DEFAULT 'unknown';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS friend_status_at timestamptz;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS followed_at timestamptz;
