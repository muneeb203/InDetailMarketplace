-- Add service_radius_miles to dealer_profiles
-- Used for dealer service area boundary (max travel distance in miles)
ALTER TABLE dealer_profiles
ADD COLUMN IF NOT EXISTS service_radius_miles integer DEFAULT 10;
