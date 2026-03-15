-- Create Essential Tables for Development
-- This creates only the minimum tables needed for payment testing

-- 1. Create marketplace_payment_intents table
CREATE TABLE IF NOT EXISTS marketplace_payment_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  stripe_payment_intent_id text NOT NULL UNIQUE,
  amount_total integer NOT NULL CHECK (amount_total > 0),
  amount_upfront integer NOT NULL CHECK (amount_upfront >= 0),
  amount_remaining integer NOT NULL CHECK (amount_remaining >= 0),
  platform_fee integer NOT NULL CHECK (platform_fee >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create stripe_connected_accounts table
CREATE TABLE IF NOT EXISTS stripe_connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detailer_id uuid NOT NULL,
  stripe_account_id text NOT NULL UNIQUE,
  account_status text NOT NULL DEFAULT 'active' CHECK (account_status IN ('pending', 'active', 'restricted', 'rejected')),
  capabilities_enabled boolean DEFAULT true,
  payouts_enabled boolean DEFAULT true,
  onboarding_completed boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Add marketplace columns to orders table if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS marketplace_status TEXT DEFAULT 'pending_payment';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_total integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_upfront integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_remaining integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS platform_fee integer;

-- 4. Insert a mock Stripe account for testing (replace with your actual IDs)
INSERT INTO stripe_connected_accounts (
  detailer_id,
  stripe_account_id,
  account_status,
  capabilities_enabled,
  payouts_enabled,
  onboarding_completed
) VALUES (
  'cc589876-4c8d-4059-b0d0-e22082c916bd', -- Replace with your detailer ID
  'acct_1773588221596_n3fmvhsjv',         -- Replace with your Stripe account ID
  'active',
  true,
  true,
  true
) ON CONFLICT (stripe_account_id) DO UPDATE SET
  account_status = 'active',
  capabilities_enabled = true,
  payouts_enabled = true,
  onboarding_completed = true,
  updated_at = now();

-- 5. Update existing orders to have correct marketplace_status
UPDATE orders 
SET marketplace_status = 'pending_payment' 
WHERE marketplace_status IS NULL OR marketplace_status = '';

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_marketplace_payment_intents_order_id ON marketplace_payment_intents(order_id);
CREATE INDEX IF NOT EXISTS idx_stripe_connected_accounts_detailer_id ON stripe_connected_accounts(detailer_id);
CREATE INDEX IF NOT EXISTS idx_orders_marketplace_status ON orders(marketplace_status);

-- 7. Verify everything was created
SELECT 'marketplace_payment_intents' as table_name, COUNT(*) as records FROM marketplace_payment_intents
UNION ALL
SELECT 'stripe_connected_accounts' as table_name, COUNT(*) as records FROM stripe_connected_accounts
UNION ALL
SELECT 'orders with marketplace_status' as table_name, COUNT(*) as records FROM orders WHERE marketplace_status IS NOT NULL;

-- Show the created Stripe account
SELECT 
  detailer_id,
  stripe_account_id,
  account_status,
  payouts_enabled
FROM stripe_connected_accounts 
LIMIT 5;