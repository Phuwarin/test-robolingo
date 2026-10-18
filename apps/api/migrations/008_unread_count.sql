DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='messages' AND column_name='read_at') THEN
  ALTER TABLE messages ADD COLUMN read_at timestamptz;
  -- Historical messages have no read history, so initialize them as read.
  UPDATE messages SET read_at=now() WHERE direction='received';
 END IF;
END $$;
ALTER TABLE line_users ADD COLUMN IF NOT EXISTS unread_count integer NOT NULL DEFAULT 0;
UPDATE line_users SET unread_count=(SELECT count(*) FROM messages WHERE line_user_id=line_users.id AND direction='received' AND read_at IS NULL);
