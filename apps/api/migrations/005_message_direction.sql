ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_direction_check;
UPDATE messages SET direction=CASE direction WHEN 'in' THEN 'received' WHEN 'out' THEN 'botSent' ELSE direction END;
ALTER TABLE messages ADD CONSTRAINT messages_direction_check CHECK (direction IN ('received','botSent'));
