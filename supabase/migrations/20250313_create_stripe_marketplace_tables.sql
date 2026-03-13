-- Stripe Marketplace Payment System Database Schema
-- Creates tables for Stripe Connect accounts, payment intents, and payout records

-- Create enum for marketplace order status
DO $$ BEGIN
  CREATE TYPE marketplace_order_status AS ENUM (
    'pending_payment',      -- Client initiated booking, payment pending
    'paid',                 -- Payment captured, funds in escrow
    'detailer_notified',    -- Detailer notified of job
    'detailer_accepted',    -- Detailer accepted, 15% paid out
    'detailer_rejected',    -- Detailer rejected, full refund
    'in_progress',          -- Job in progress
    'detailer_marked_done', -- Detailer marked complete, awaiting client confirmation
    'client_confirmed',     -- Client confirmed, 85% paid out
    'auto_confirmed',       -- Auto-confirmed after timeout, 85% paid out
    'completed',            -- Job fully completed
    'disputed'              -- Payment disputed
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Stripe Connected Accounts table
CREATE TABLE IF NOT EXISTS stripe_connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detailer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_account_id text NOT NULL UNIQUE,
  account_status text NOT NULL DEFAULT 'pending' CHECK (account_status IN ('pending', 'active', 'restricted', 'rejected')),
  capabilities_enabled boolean DEFAULT false,
  payouts_enabled boolean DEFAULT false,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Marketplace Payment Intents table
CREATE TABLE IF NOT EXISTS marketplace_payment_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stripe_payment_intent_id text NOT NULL UNIQUE,
  amount_total integer NOT NULL CHECK (amount_total > 0), -- Amount in cents
  amount_upfront integer NOT NULL CHECK (amount_upfront >= 0), -- 15% upfront in cents
  amount_remaining integer NOT NULL CHECK (amount_remaining >= 0), -- 85% remaining in cents
  platform_fee integer NOT NULL CHECK (platform_fee >= 0), -- Platform fee in cents
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payout Records table
CREATE TABLE IF NOT EXISTS payout_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  detailer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_transfer_id text NOT NULL UNIQUE,
  amount integer NOT NULL CHECK (amount > 0), -- Amount in cents
  payout_type text NOT NULL CHECK (payout_type IN ('upfront', 'completion')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Add marketplace payment fields to existing orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS marketplace_status marketplace_order_status DEFAULT 'pending_payment',
ADD COLUMN IF NOT EXISTS amount_total integer, -- Total amount in cents
ADD COLUMN IF NOT EXISTS amount_upfront integer, -- 15% upfront in cents  
ADD COLUMN IF NOT EXISTS amount_remaining integer, -- 85% remaining in cents
ADD COLUMN IF NOT EXISTS platform_fee integer, -- Platform fee in cents
ADD COLUMN IF NOT EXISTS confirmation_deadline timestamptz,
ADD COLUMN IF NOT EXISTS auto_release_scheduled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS completed_at timestamptz,
ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_stripe_connected_accounts_detailer_id ON stripe_connected_accounts(detailer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_connected_accounts_stripe_account_id ON stripe_connected_accounts(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_stripe_connected_accounts_status ON stripe_connected_accounts(account_status);

CREATE INDEX IF NOT EXISTS idx_marketplace_payment_intents_order_id ON marketplace_payment_intents(order_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_payment_intents_stripe_id ON marketplace_payment_intents(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_payment_intents_status ON marketplace_payment_intents(status);

CREATE INDEX IF NOT EXISTS idx_payout_records_order_id ON payout_records(order_id);
CREATE INDEX IF NOT EXISTS idx_payout_records_detailer_id ON payout_records(detailer_id);
CREATE INDEX IF NOT EXISTS idx_payout_records_type ON payout_records(payout_type);
CREATE INDEX IF NOT EXISTS idx_payout_records_status ON payout_records(status);

CREATE INDEX IF NOT EXISTS idx_orders_marketplace_status ON orders(marketplace_status);
CREATE INDEX IF NOT EXISTS idx_orders_confirmation_deadline ON orders(confirmation_deadline);
CREATE INDEX IF NOT EXISTS idx_orders_auto_release_scheduled ON orders(auto_release_scheduled);

-- Enable Realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE stripe_connected_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_payment_intents;
ALTER PUBLICATION supabase_realtime ADD TABLE payout_records;

-- RLS Policies for stripe_connected_accounts
ALTER TABLE stripe_connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Detailers can view own connected accounts"
ON stripe_connected_accounts FOR SELECT TO authenticated
USING (detailer_id = auth.uid());

CREATE POLICY "Detailers can insert own connected accounts"
ON stripe_connected_accounts FOR INSERT TO authenticated
WITH CHECK (detailer_id = auth.uid());

CREATE POLICY "Detailers can update own connected accounts"
ON stripe_connected_accounts FOR UPDATE TO authenticated
USING (detailer_id = auth.uid())
WITH CHECK (detailer_id = auth.uid());

-- RLS Policies for marketplace_payment_intents
ALTER TABLE marketplace_payment_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payment intents for their orders"
ON marketplace_payment_intents FOR SELECT TO authenticated
USING (
  order_id IN (
    SELECT id FROM orders 
    WHERE client_id = auth.uid() OR dealer_id = auth.uid()
  )
);

CREATE POLICY "System can manage payment intents"
ON marketplace_payment_intents FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- RLS Policies for payout_records
ALTER TABLE payout_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Detailers can view own payout records"
ON payout_records FOR SELECT TO authenticated
USING (detailer_id = auth.uid());

CREATE POLICY "Users can view payout records for their orders"
ON payout_records FOR SELECT TO authenticated
USING (
  order_id IN (
    SELECT id FROM orders 
    WHERE client_id = auth.uid() OR dealer_id = auth.uid()
  )
);

CREATE POLICY "System can manage payout records"
ON payout_records FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_stripe_connected_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_marketplace_payment_intents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stripe_connected_accounts_updated_at ON stripe_connected_accounts;
CREATE TRIGGER stripe_connected_accounts_updated_at
  BEFORE UPDATE ON stripe_connected_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_stripe_connected_accounts_updated_at();

DROP TRIGGER IF EXISTS marketplace_payment_intents_updated_at ON marketplace_payment_intents;
CREATE TRIGGER marketplace_payment_intents_updated_at
  BEFORE UPDATE ON marketplace_payment_intents
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_payment_intents_updated_at();

-- Add constraint to ensure amount calculations are correct
ALTER TABLE marketplace_payment_intents
ADD CONSTRAINT check_amount_calculations CHECK (
  amount_upfront + amount_remaining + platform_fee <= amount_total
);

-- Add constraint to ensure only one payout per type per order
CREATE UNIQUE INDEX IF NOT EXISTS idx_payout_records_unique_type_per_order 
ON payout_records(order_id, payout_type) 
WHERE status = 'succeeded';

-- Function to calculate platform fee (2.9% + $0.30)
CREATE OR REPLACE FUNCTION calculate_platform_fee(amount_cents integer)
RETURNS integer AS $$
BEGIN
  -- 2.9% + $0.30 (30 cents)
  RETURN FLOOR(amount_cents * 0.029) + 30;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate upfront amount (15%)
CREATE OR REPLACE FUNCTION calculate_upfront_amount(amount_cents integer)
RETURNS integer AS $$
BEGIN
  RETURN FLOOR(amount_cents * 0.15);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate remaining amount (85%)
CREATE OR REPLACE FUNCTION calculate_remaining_amount(amount_cents integer)
RETURNS integer AS $$
BEGIN
  RETURN amount_cents - calculate_upfront_amount(amount_cents);
END;
$$ LANGUAGE plpgsql;