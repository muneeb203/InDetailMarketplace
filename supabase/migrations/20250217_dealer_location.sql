-- Add location columns to dealer_profiles (if not using PostGIS)
ALTER TABLE dealer_profiles
ADD COLUMN IF NOT EXISTS location_lat double precision,
ADD COLUMN IF NOT EXISTS location_lng double precision;

-- RLS: Dealer can only insert their own profile
CREATE POLICY "Dealer can insert own profile"
ON dealer_profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());
