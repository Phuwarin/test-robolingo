DO $$
DECLARE relation record;
BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='line_users' AND column_name='line_user_id') THEN
  ALTER TABLE line_users ADD COLUMN line_user_id text;
  UPDATE line_users SET line_user_id=id;
  CREATE TEMP TABLE user_id_map ON COMMIT DROP AS SELECT id AS old_id,gen_random_uuid()::text AS new_id FROM line_users;
  CREATE TEMP TABLE message_id_map ON COMMIT DROP AS SELECT id AS old_id,gen_random_uuid()::text AS new_id FROM messages WHERE direction='received';
  FOR relation IN SELECT conname FROM pg_constraint WHERE conrelid='messages'::regclass AND confrelid='line_users'::regclass AND contype='f' LOOP
   EXECUTE format('ALTER TABLE messages DROP CONSTRAINT %I',relation.conname);
  END LOOP;
  UPDATE messages SET line_user_id=map.new_id FROM user_id_map map WHERE messages.line_user_id=map.old_id;
  UPDATE line_users SET id=map.new_id FROM user_id_map map WHERE line_users.id=map.old_id;
  UPDATE line_users SET last_message_id=map.new_id FROM message_id_map map WHERE line_users.last_message_id=map.old_id;
  UPDATE messages SET id=map.new_id FROM message_id_map map WHERE messages.id=map.old_id;
  ALTER TABLE line_users ALTER COLUMN line_user_id SET NOT NULL;
  ALTER TABLE messages ADD CONSTRAINT messages_line_user_id_fkey FOREIGN KEY(line_user_id) REFERENCES line_users(id);
 END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS line_users_line_user_id_unique ON line_users(line_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS messages_line_message_id_unique ON messages(line_message_id);
