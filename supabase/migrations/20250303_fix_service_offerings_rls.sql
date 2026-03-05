-- Fix RLS policies for service_offerings table
-- The issue: auth.uid() is the user's auth ID, but dealer_id references dealer_profiles.id
-- We need to check if the authenticated user owns the dealer profile

-- Drop existing policies
DROP POLICY IF EXISTS "Dealers can read own offerings" ON service_offerings;
DROP POLICY IF EXISTS "Clients can read active offerings" ON service_offerings;
DROP POLICY IF EXISTS "Dealers can create offerings" ON service_offerings;
DROP POLICY IF EXISTS "Dealers can update own offerings" ON service_offerings;
DROP POLICY IF EXISTS "Dealers can delete own offerings" ON service_offerings;

-- Dealers can read their own offerings (check via dealer_profiles)
CREATE POLICY "Dealers can read own offerings"
ON service_offerings FOR SELECT
USING (
  dealer_id IN (
    SELECT id FROM dealer_profiles WHERE id = auth.uid()
  )
);

-- Clients can read active offerings (anyone can read active offerings)
CREATE POLICY "Clients can read active offerings"
ON service_offerings FOR SELECT
USING (is_active = true);

-- Dealers can create offerings (check via dealer_profiles)
CREATE POLICY "Dealers can create offerings"
ON service_offerings FOR INSERT
WITH CHECK (
  dealer_id IN (
    SELECT id FROM dealer_profiles WHERE id = auth.uid()
  )
);

-- Dealers can update their own offerings (check via dealer_profiles)
CREATE POLICY "Dealers can update own offerings"
ON service_offerings FOR UPDATE
USING (
  dealer_id IN (
    SELECT id FROM dealer_profiles WHERE id = auth.uid()
  )
);

-- Dealers can delete their own offerings (check via dealer_profiles)
CREATE POLICY "Dealers can delete own offerings"
ON service_offerings FOR DELETE
USING (
  dealer_id IN (
    SELECT id FROM dealer_profiles WHERE id = auth.uid()
  )
);

