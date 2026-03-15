-- Create Mock Stripe Account for Development
-- This creates a fake Stripe Connect account for testing payments

-- First, ensure the stripe_connected_accounts table exists
CREATE TABLE IF NOT EXISTS stripe_connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detailer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_account_id text NOT NULL UNIQUE,
  account_status text NOT NULL DEFAULT 'active' CHECK (account_status IN ('pending', 'active', 'restricted', 'rejected')),
  capabilities_enabled boolean DEFAULT true,
  payouts_enabled boolean DEFAULT true,
  onboarding_completed boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert a mock Stripe account for the detailer (replace with actual detailer ID)
-- You can find the detailer ID from the console log: "Found Stripe account for detailer"
INSERT INTO stripe_connected_accounts (
  detailer_id,
  stripe_account_id,
  account_status,
  capabilities_enabled,
  payouts_enabled,
  onboarding_completed
) VALUES (
  'cc589876-4c8d-4059-b0d0-e22082c916bd', -- Replace with your detailer ID
  'acct_1773578020452_05h3oauhz',         -- Replace with the account ID from console
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

-- Verify the account was created
SELECT 
  detailer_id,
  stripe_account_id,
  account_status,
  capabilities_enabled,
  payouts_enabled,
  onboarding_completed
FROM stripe_connected_accounts 
WHERE detailer_id = 'cc589876-4c8d-4059-b0d0-e22082c916bd';

-- If you need to find your detailer ID, run this:
-- SELECT id, business_name FROM dealer_profiles LIMIT 10;