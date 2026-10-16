DO $$
BEGIN
 IF to_regclass('contacts') IS NOT NULL AND to_regclass('line_users') IS NOT NULL THEN
  RAISE EXCEPTION 'Both contacts and line_users exist; reconcile them before migration';
 END IF;
 IF to_regclass('contacts') IS NOT NULL THEN
  ALTER TABLE contacts RENAME TO line_users;
 END IF;
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='messages' AND column_name='contact_id') THEN
  ALTER TABLE messages RENAME COLUMN contact_id TO line_user_id;
 END IF;
END $$;
ALTER TABLE line_users ADD COLUMN IF NOT EXISTS picture_url text;
ALTER TABLE line_users ADD COLUMN IF NOT EXISTS friend_status text NOT NULL DEFAULT 'unknown';
ALTER TABLE line_users ADD COLUMN IF NOT EXISTS friend_status_at timestamptz;
ALTER TABLE line_users ADD COLUMN IF NOT EXISTS followed_at timestamptz;
UPDATE line_users SET friend_status='follow' WHERE friend_status='friend';
