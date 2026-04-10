-- Dealer Settings - additional columns for dealer_profiles
-- Run this if columns don't exist

ALTER TABLE dealer_profiles
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS certifications text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS years_in_business integer,
ADD COLUMN IF NOT EXISTS comm_preference text DEFAULT 'voice-chat',
ADD COLUMN IF NOT EXISTS operating_hours jsonb,
ADD COLUMN IF NOT EXISTS is_insured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pro boolean DEFAULT false;

-- RLS: Dealer can update own profile
CREATE POLICY "Dealer can update own profile"
ON dealer_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
