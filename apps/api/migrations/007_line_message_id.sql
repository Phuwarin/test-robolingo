ALTER TABLE messages ADD COLUMN IF NOT EXISTS line_message_id text;
UPDATE messages SET line_message_id=id WHERE direction='received' AND line_message_id IS NULL;
