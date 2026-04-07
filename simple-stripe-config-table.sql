-- Simple version - Create stripe_config table
-- Run this in Supabase SQL Editor if the main version has issues

-- Create the table
CREATE TABLE IF NOT EXISTS public.stripe_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    publishable_key TEXT,
    secret_key_encrypted TEXT,
    webhook_secret_encrypted TEXT,
    is_live_mode BOOLEAN DEFAULT false,
    account_id TEXT,
    account_name TEXT,
    setup_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

-- Enable RLS but with a simple policy
ALTER TABLE public.stripe_config ENABLE ROW LEVEL SECURITY;

-- Simple policy - allow authenticated users (you can restrict this later)
CREATE POLICY "Allow authenticated users" ON public.stripe_config
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert default row
INSERT INTO public.stripe_config (setup_completed) 
SELECT false 
WHERE NOT EXISTS (SELECT 1 FROM public.stripe_config);

-- Grant permissions
GRANT ALL ON public.stripe_config TO authenticated;
GRANT ALL ON public.stripe_config TO service_role;