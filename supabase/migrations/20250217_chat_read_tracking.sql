-- Track when each party last read the conversation (for unread count)
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS client_last_read_at timestamptz,
ADD COLUMN IF NOT EXISTS dealer_last_read_at timestamptz;

-- RLS: users can update their own last_read
DROP POLICY IF EXISTS "Clients can update own last_read" ON conversations;
CREATE POLICY "Clients can update own last_read"
ON conversations FOR UPDATE TO authenticated
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Dealers can update own last_read" ON conversations;
CREATE POLICY "Dealers can update own last_read"
ON conversations FOR UPDATE TO authenticated
USING (dealer_id = auth.uid())
WITH CHECK (dealer_id = auth.uid());
