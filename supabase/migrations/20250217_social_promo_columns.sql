-- Add social_handles and promo columns to dealer_profiles
ALTER TABLE dealer_profiles
ADD COLUMN IF NOT EXISTS social_handles jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS promo jsonb DEFAULT '{}'::jsonb;
