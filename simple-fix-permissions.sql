-- Simple fix for stripe_config permissions
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage stripe config" ON public.stripe_config;
DROP POLICY IF EXISTS "Allow authenticated users to manage stripe config" ON public.stripe_config;

-- Create simple policy that allows all authenticated users
CREATE POLICY "stripe_config_policy" ON public.stripe_config
    FOR ALL USING (true);

-- Make sure permissions are set
GRANT ALL ON public.stripe_config TO authenticated;
GRANT ALL ON public.stripe_config TO service_role;
GRANT ALL ON public.stripe_config TO anon;