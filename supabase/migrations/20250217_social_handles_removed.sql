-- Remove social_handles from dealer_profiles; social links now live in dealer_social_links
-- Must run after 20250217_social_promo_columns.sql
ALTER TABLE dealer_profiles
DROP COLUMN IF EXISTS social_handles;
