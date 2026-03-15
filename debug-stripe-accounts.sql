-- Debug: Check Stripe Connect accounts in database
-- Run this to see what accounts exist and their status

-- Check all Stripe Connect accounts
SELECT 
  id,
  detailer_id,
  stripe_account_id,
  account_status,
  capabilities_enabled,
  payouts_enabled,
  onboarding_completed,
  created_at
FROM stripe_connected_accounts
ORDER BY created_at DESC;

-- Check if there are any dealer profiles
SELECT 
  id,
  business_name,
  created_at
FROM dealer_profiles
ORDER BY created_at DESC
LIMIT 5;

-- Check for any recent orders (basic columns only since marketplace columns may not exist)
SELECT 
  id,
  dealer_id,
  client_id,
  status,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;