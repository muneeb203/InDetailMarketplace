-- Create service_offerings table
CREATE TABLE IF NOT EXISTS service_offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealer_profiles(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  pricing_model text NOT NULL CHECK (pricing_model IN ('single', 'multi-tier')),
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- A dealer can only offer each service once
  CONSTRAINT unique_dealer_service UNIQUE (dealer_id, service_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_offerings_dealer_id ON service_offerings(dealer_id);
CREATE INDEX IF NOT EXISTS idx_service_offerings_service_id ON service_offerings(service_id);
CREATE INDEX IF NOT EXISTS idx_service_offerings_active ON service_offerings(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE service_offerings ENABLE ROW LEVEL SECURITY;

-- Dealers can read their own offerings
CREATE POLICY "Dealers can read own offerings"
ON service_offerings FOR SELECT
USING (dealer_id = auth.uid());

-- Clients can read active offerings
CREATE POLICY "Clients can read active offerings"
ON service_offerings FOR SELECT
USING (is_active = true);

-- Dealers can create offerings
CREATE POLICY "Dealers can create offerings"
ON service_offerings FOR INSERT
WITH CHECK (dealer_id = auth.uid());

-- Dealers can update their own offerings
CREATE POLICY "Dealers can update own offerings"
ON service_offerings FOR UPDATE
USING (dealer_id = auth.uid());

-- Dealers can delete their own offerings
CREATE POLICY "Dealers can delete own offerings"
ON service_offerings FOR DELETE
USING (dealer_id = auth.uid());
