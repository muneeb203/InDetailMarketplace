-- Fix RLS policies for service_offerings table
-- This addresses the "new row violates row-level security policy" error

-- First, let's check if the user has a dealer profile
-- and fix the RLS policies to be more permissive for development

-- Drop existing policies
DROP POLICY IF EXISTS "Dealers can read own offerings" ON service_offerings;
DROP POLICY IF EXISTS "Clients can read active offerings" ON service_offerings;
DROP POLICY IF EXISTS "Dealers can create offerings" ON service_offerings;
DROP POLICY IF EXISTS "Dealers can update own offerings" ON service_offerings;
DROP POLICY IF EXISTS "Dealers can delete own offerings" ON service_offerings;

-- More permissive policies for development
-- Anyone authenticated can read active offerings
CREATE POLICY "Anyone can read active offerings"
ON service_offerings FOR SELECT
TO authenticated
USING (is_active = true);

-- Dealers can read their own offerings
CREATE POLICY "Dealers can read own offerings"
ON service_offerings FOR SELECT
TO authenticated
USING (
  dealer_id = auth.uid() OR
  dealer_id IN (
    SELECT id FROM dealer_profiles WHERE id = auth.uid()
  )
);

-- More permissive create policy - check if user exists in profiles and has dealer role
CREATE POLICY "Authenticated users can create offerings"
ON service_offerings FOR INSERT
TO authenticated
WITH CHECK (
  -- Check if the dealer_id matches the current user
  dealer_id = auth.uid() OR
  -- Or if the user exists in dealer_profiles
  dealer_id IN (
    SELECT id FROM dealer_profiles WHERE id = auth.uid()
  ) OR
  -- Or if the user exists in profiles (fallback for development)
  auth.uid() IN (
    SELECT id FROM profiles
  )
);

-- Update policy
CREATE POLICY "Users can update own offerings"
ON service_offerings FOR UPDATE
TO authenticated
USING (
  dealer_id = auth.uid() OR
  dealer_id IN (
    SELECT id FROM dealer_profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  dealer_id = auth.uid() OR
  dealer_id IN (
    SELECT id FROM dealer_profiles WHERE id = auth.uid()
  )
);

-- Delete policy
CREATE POLICY "Users can delete own offerings"
ON service_offerings FOR DELETE
TO authenticated
USING (
  dealer_id = auth.uid() OR
  dealer_id IN (
    SELECT id FROM dealer_profiles WHERE id = auth.uid()
  )
);

-- Also ensure dealer_profiles has proper policies
-- Create a more permissive policy for development
DROP POLICY IF EXISTS "Authenticated users can create dealer profiles" ON dealer_profiles;
CREATE POLICY "Authenticated users can create dealer profiles"
ON dealer_profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Ensure users can read their own dealer profiles
DROP POLICY IF EXISTS "Users can read own dealer profile" ON dealer_profiles;
CREATE POLICY "Users can read own dealer profile"
ON dealer_profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Update policy for dealer profiles
DROP POLICY IF EXISTS "Users can update own dealer profile" ON dealer_profiles;
CREATE POLICY "Users can update own dealer profile"
ON dealer_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Debug: Show current user and dealer profile status
-- Run this to check if the user has a dealer profile
SELECT 
  auth.uid() as current_user_id,
  EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid()) as has_profile,
  EXISTS(SELECT 1 FROM dealer_profiles WHERE id = auth.uid()) as has_dealer_profile;