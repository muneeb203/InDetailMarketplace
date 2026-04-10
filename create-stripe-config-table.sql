-- Create stripe_config table for admin Stripe API keys
-- Run this in your Supabase SQL Editor

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
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.stripe_config ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
-- Note: Adjust this policy based on how you identify admin users
CREATE POLICY "Admin can manage stripe config" ON public.stripe_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stripe_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_stripe_config_updated_at
    BEFORE UPDATE ON public.stripe_config
    FOR EACH ROW
    EXECUTE FUNCTION update_stripe_config_updated_at();

-- Insert default row if none exists
INSERT INTO public.stripe_config (setup_completed) 
SELECT false 
WHERE NOT EXISTS (SELECT 1 FROM public.stripe_config);

-- Grant necessary permissions
GRANT ALL ON public.stripe_config TO authenticated;
GRANT ALL ON public.stripe_config TO service_role;