-- Ensure the current user has a dealer profile
-- Run this if you're getting RLS policy violations

-- First, check current user status
SELECT 
  auth.uid() as current_user_id,
  auth.email() as current_user_email,
  EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid()) as has_profile,
  EXISTS(SELECT 1 FROM dealer_profiles WHERE id = auth.uid()) as has_dealer_profile;

-- If you're not authenticated, you need to log in first
-- If auth.uid() is NULL, this script won't work

-- Create a basic dealer profile (simplified version without business_type)
-- Only run this if you're authenticated (auth.uid() is not NULL)
INSERT INTO dealer_profiles (
  id,
  business_name,
  phone,
  address,
  city,
  state,
  zip_code,
  price_range,
  bio,
  created_at,
  updated_at
)
SELECT 
  auth.uid(),
  'Test Detailing Business',
  '555-0123',
  '123 Test Street',
  'Test City',
  'CA',
  '90210',
  '$$',
  'Test detailing business for development',
  now(),
  now()
WHERE auth.uid() IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM dealer_profiles WHERE id = auth.uid()
  );

-- Verify the dealer profile was created
SELECT 
  id,
  business_name,
  created_at
FROM dealer_profiles 
WHERE id = auth.uid();