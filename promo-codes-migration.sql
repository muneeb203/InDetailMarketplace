-- Promo Codes Database Schema
-- Run this in Supabase SQL Editor to create promo code functionality

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealer_profiles(id) ON DELETE CASCADE,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('public', 'private')),
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(10,2) NOT NULL CHECK (discount_value > 0),
  expiration_date timestamptz,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  max_uses integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure code is unique per dealer
  UNIQUE(dealer_id, code)
);

-- Create promo_code_usage table to track usage
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  discount_amount numeric(10,2) NOT NULL,
  used_at timestamptz DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_promo_codes_dealer_id ON promo_codes(dealer_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_promo_codes_expiration ON promo_codes(expiration_date) WHERE expiration_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_promo_code_usage_promo_code_id ON promo_code_usage(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_client_id ON promo_code_usage(client_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_order_id ON promo_code_usage(order_id);

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promo_codes
CREATE POLICY "Dealers can manage own promo codes"
ON promo_codes FOR ALL
TO authenticated
USING (dealer_id = auth.uid())
WITH CHECK (dealer_id = auth.uid());

CREATE POLICY "Clients can view active public promo codes"
ON promo_codes FOR SELECT
TO authenticated
USING (is_active = true AND type = 'public' AND (expiration_date IS NULL OR expiration_date > now()));

-- RLS Policies for promo_code_usage
CREATE POLICY "Dealers can view usage of their promo codes"
ON promo_code_usage FOR SELECT
TO authenticated
USING (
  promo_code_id IN (
    SELECT id FROM promo_codes WHERE dealer_id = auth.uid()
  )
);

CREATE POLICY "Clients can view their own usage"
ON promo_code_usage FOR SELECT
TO authenticated
USING (client_id = auth.uid());

CREATE POLICY "System can insert usage records"
ON promo_code_usage FOR INSERT
TO authenticated
WITH CHECK (true);

-- Trigger to update usage count
CREATE OR REPLACE FUNCTION update_promo_code_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE promo_codes 
    SET usage_count = usage_count + 1, updated_at = now()
    WHERE id = NEW.promo_code_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE promo_codes 
    SET usage_count = GREATEST(usage_count - 1, 0), updated_at = now()
    WHERE id = OLD.promo_code_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS promo_code_usage_count_trigger ON promo_code_usage;
CREATE TRIGGER promo_code_usage_count_trigger
  AFTER INSERT OR DELETE ON promo_code_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_promo_code_usage_count();

-- Function to validate and apply promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code text,
  p_dealer_id uuid,
  p_client_id uuid,
  p_order_total numeric
)
RETURNS TABLE(
  valid boolean,
  discount_amount numeric,
  error_message text,
  promo_code_id uuid
) AS $$
DECLARE
  v_promo_code promo_codes%ROWTYPE;
  v_discount_amount numeric;
BEGIN
  -- Find the promo code
  SELECT * INTO v_promo_code
  FROM promo_codes
  WHERE code = p_code 
    AND dealer_id = p_dealer_id
    AND is_active = true;
  
  -- Check if code exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::numeric, 'Invalid promo code'::text, null::uuid;
    RETURN;
  END IF;
  
  -- Check expiration
  IF v_promo_code.expiration_date IS NOT NULL AND v_promo_code.expiration_date < now() THEN
    RETURN QUERY SELECT false, 0::numeric, 'Promo code has expired'::text, null::uuid;
    RETURN;
  END IF;
  
  -- Check usage limit
  IF v_promo_code.max_uses IS NOT NULL AND v_promo_code.usage_count >= v_promo_code.max_uses THEN
    RETURN QUERY SELECT false, 0::numeric, 'Promo code usage limit reached'::text, null::uuid;
    RETURN;
  END IF;
  
  -- Calculate discount
  IF v_promo_code.discount_type = 'percentage' THEN
    v_discount_amount := p_order_total * (v_promo_code.discount_value / 100);
  ELSE
    v_discount_amount := v_promo_code.discount_value;
  END IF;
  
  -- Ensure discount doesn't exceed order total
  v_discount_amount := LEAST(v_discount_amount, p_order_total);
  
  RETURN QUERY SELECT true, v_discount_amount, null::text, v_promo_code.id;
END;
$$ LANGUAGE plpgsql;

-- Function to apply promo code (record usage)
CREATE OR REPLACE FUNCTION apply_promo_code(
  p_promo_code_id uuid,
  p_order_id uuid,
  p_client_id uuid,
  p_discount_amount numeric
)
RETURNS boolean AS $$
BEGIN
  INSERT INTO promo_code_usage (promo_code_id, order_id, client_id, discount_amount)
  VALUES (p_promo_code_id, p_order_id, p_client_id, p_discount_amount);
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample promo codes for testing
INSERT INTO promo_codes (dealer_id, code, type, discount_type, discount_value, is_active)
SELECT 
  id,
  'SAVE10',
  'public',
  'percentage',
  10.00,
  true
FROM dealer_profiles
WHERE NOT EXISTS (
  SELECT 1 FROM promo_codes WHERE code = 'SAVE10' AND dealer_id = dealer_profiles.id
)
LIMIT 1;

-- Enable realtime for promo codes
ALTER PUBLICATION supabase_realtime ADD TABLE promo_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE promo_code_usage;