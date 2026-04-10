-- Fix permissions for stripe_config table
-- Run this in Supabase SQL Editor

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admin can manage stripe config" ON public.stripe_config;

-- Create a more permissive policy for now (you can restrict later)
CREATE POLICY "Allow authenticated users to manage stripe config" ON public.stripe_config
    FOR ALL USING (auth.role() = 'authenticated');

-- Make sure the table has proper permissions
GRANT ALL ON public.stripe_config TO authenticated;
GRANT ALL ON public.stripe_config TO service_role;

-- Ensure there's a default row
INSERT INTO public.stripe_config (setup_completed) 
SELECT false 
WHERE NOT EXISTS (SELECT 1 FROM public.stripe_config);