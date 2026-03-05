-- Create service_prices table
CREATE TABLE IF NOT EXISTS service_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_offering_id uuid NOT NULL REFERENCES service_offerings(id) ON DELETE CASCADE,
  vehicle_category_id uuid NOT NULL REFERENCES vehicle_categories(id) ON DELETE CASCADE,
  price numeric(10,2) NOT NULL CHECK (price > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Each offering can have only one price per vehicle category
  CONSTRAINT unique_offering_category_price UNIQUE (service_offering_id, vehicle_category_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_prices_offering_id ON service_prices(service_offering_id);
CREATE INDEX IF NOT EXISTS idx_service_prices_category_id ON service_prices(vehicle_category_id);

-- Enable RLS
ALTER TABLE service_prices ENABLE ROW LEVEL SECURITY;

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
