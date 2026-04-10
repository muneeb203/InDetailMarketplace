-- conversations: client-dealer chat threads (only client can create)
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dealer_id uuid NOT NULL REFERENCES dealer_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, dealer_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_dealer_id ON conversations(dealer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);

-- messages: chat messages within a conversation
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(conversation_id, created_at ASC);

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- RLS: conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Clients can view their own conversations
CREATE POLICY "Clients can view own conversations"
ON conversations FOR SELECT TO authenticated
USING (client_id = auth.uid());

-- Clients can insert (create) conversations (only client can initiate)
CREATE POLICY "Clients can create conversations"
ON conversations FOR INSERT TO authenticated
WITH CHECK (client_id = auth.uid());

-- Dealers can view conversations where they are the dealer
CREATE POLICY "Dealers can view own conversations"
ON conversations FOR SELECT TO authenticated
USING (dealer_id = auth.uid());

-- Dealers cannot insert conversations (business rule: only client initiates)
-- No INSERT policy for dealers

-- RLS: messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in conversations they participate in
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
    AND (c.client_id = auth.uid() OR c.dealer_id = auth.uid())
  )
);

-- Users can insert messages in conversations they participate in
CREATE POLICY "Users can send messages in their conversations"
ON messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
    AND (c.client_id = auth.uid() OR c.dealer_id = auth.uid())
  )
);
