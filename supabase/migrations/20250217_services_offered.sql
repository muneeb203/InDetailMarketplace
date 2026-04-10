-- Add services_offered to dealer_profiles (JSONB: { specialties: string[], serviceRadius?: number })
ALTER TABLE dealer_profiles
ADD COLUMN IF NOT EXISTS services_offered jsonb DEFAULT '{"specialties":[],"serviceRadius":15}'::jsonb;
