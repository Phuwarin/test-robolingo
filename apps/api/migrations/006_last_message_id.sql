ALTER TABLE line_users ADD COLUMN IF NOT EXISTS last_message_id text;
UPDATE line_users SET last_message_id=(SELECT id FROM messages WHERE line_user_id=line_users.id ORDER BY created_at DESC,id DESC LIMIT 1);
