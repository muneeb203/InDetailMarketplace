-- Fix RLS policies for service_prices table
-- dealer_profiles.id = auth.uid() for dealers, so we can check directly

-- Drop existing policies
DROP POLICY IF EXISTS "Dealers can read own offering prices" ON service_prices;
DROP POLICY IF EXISTS "Clients can read active offering prices" ON service_prices;
DROP POLICY IF EXISTS "Dealers can manage own offering prices" ON service_prices;

-- Dealers can read prices for their offerings
CREATE POLICY "Dealers can read own offering prices"
ON service_prices FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM service_offerings
    WHERE service_offerings.id = service_prices.service_offering_id
    AND service_offerings.dealer_id = auth.uid()
  )
);

-- Clients can read prices for active offerings
CREATE POLICY "Clients can read active offering prices"
ON service_prices FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM service_offerings
    WHERE service_offerings.id = service_prices.service_offering_id
    AND service_offerings.is_active = true
  )
);

-- Dealers can manage prices for their offerings
CREATE POLICY "Dealers can manage own offering prices"
ON service_prices FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM service_offerings
    WHERE service_offerings.id = service_prices.service_offering_id
    AND service_offerings.dealer_id = auth.uid()
  )
);

