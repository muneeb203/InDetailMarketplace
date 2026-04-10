-- Simple Promo Code Fix - Run this step by step
-- Run each section separately in Supabase SQL Editor

-- Step 1: Add promo column to dealer_profiles
ALTER TABLE dealer_profiles 
ADD COLUMN IF NOT EXISTS promo jsonb DEFAULT '{}'::jsonb;

-- Step 2: Drop existing promo_codes table if it exists (to start fresh)
DROP TABLE IF EXISTS promo_code_usage CASCADE;
DROP TABLE IF EXISTS promo_codes CASCADE;

-- Step 3: Create promo_codes table with all columns
CREATE TABLE promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealer_profiles(id) ON DELETE CASCADE,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('public', 'private')),
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(10,2) NOT NULL CHECK (discount_value > 0),
  expiration_date timestamptz,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  max_uses integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(dealer_id, code)
);

-- Step 4: Create promo_code_usage table
CREATE TABLE promo_code_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  discount_amount numeric(10,2) NOT NULL,
  used_at timestamptz DEFAULT now()
);

-- Step 5: Create indexes
CREATE INDEX idx_promo_codes_dealer_id ON promo_codes(dealer_id);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active) WHERE is_active = true;
CREATE INDEX idx_promo_codes_expiration ON promo_codes(expiration_date) WHERE expiration_date IS NOT NULL;

-- Step 6: Disable RLS temporarily for easier setup
ALTER TABLE promo_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage DISABLE ROW LEVEL SECURITY;

-- Step 7: Enable RLS with simple policies
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" ON promo_codes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON promo_code_usage FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Step 8: Verify tables were created correctly
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('promo_codes', 'promo_code_usage')
ORDER BY table_name, ordinal_position;