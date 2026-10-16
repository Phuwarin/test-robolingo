ALTER TABLE line_users ADD COLUMN IF NOT EXISTS created_at timestamptz;
UPDATE line_users SET created_at=updated_at WHERE created_at IS NULL;
ALTER TABLE line_users ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE line_users ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS updated_at timestamptz;
UPDATE messages SET updated_at=created_at WHERE updated_at IS NULL;
ALTER TABLE messages ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE messages ALTER COLUMN updated_at SET NOT NULL;
