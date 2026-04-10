-- Create webhook events table for idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  processed boolean DEFAULT false,
  error text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE webhook_events;

-- RLS (only service role should access webhook events)
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage webhook events
CREATE POLICY "Service role can manage webhook events"
ON webhook_events FOR ALL TO service_role
USING (true)
WITH CHECK (true);