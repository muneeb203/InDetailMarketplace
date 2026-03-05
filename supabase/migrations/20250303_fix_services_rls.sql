-- Fix RLS policies for services table
-- dealer_profiles.id = auth.uid() for dealers, so we can check directly

-- Drop existing policies
DROP POLICY IF EXISTS "Public can read predefined services" ON services;
DROP POLICY IF EXISTS "Dealers can read own custom services" ON services;
DROP POLICY IF EXISTS "Dealers can create custom services" ON services;
DROP POLICY IF EXISTS "Dealers can update own custom services" ON services;
DROP POLICY IF EXISTS "Dealers can delete own custom services" ON services;

-- Anyone can read predefined services
CREATE POLICY "Public can read predefined services"
ON services FOR SELECT
USING (is_predefined = true);

-- Dealers can read their own custom services
CREATE POLICY "Dealers can read own custom services"
ON services FOR SELECT
USING (dealer_id = auth.uid());

-- Dealers can create custom services
CREATE POLICY "Dealers can create custom services"
ON services FOR INSERT
WITH CHECK (dealer_id = auth.uid() AND is_predefined = false);

-- Dealers can update their own custom services
CREATE POLICY "Dealers can update own custom services"
ON services FOR UPDATE
USING (dealer_id = auth.uid() AND is_predefined = false);

-- Dealers can delete their own custom services
CREATE POLICY "Dealers can delete own custom services"
ON services FOR DELETE
USING (dealer_id = auth.uid() AND is_predefined = false);

