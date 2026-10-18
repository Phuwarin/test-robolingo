ALTER TABLE line_users ADD COLUMN IF NOT EXISTS last_message_time timestamptz;
UPDATE line_users AS u
SET last_message_time=m.created_at
FROM messages AS m
WHERE u.last_message_id=m.id AND u.last_message_time IS DISTINCT FROM m.created_at;
