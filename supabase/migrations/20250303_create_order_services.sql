-- Create order_services junction table
CREATE TABLE IF NOT EXISTS order_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_offering_id uuid NOT NULL REFERENCES service_offerings(id) ON DELETE RESTRICT,
  service_name text NOT NULL, -- Denormalized for historical record
  price_at_order numeric(10,2) NOT NULL CHECK (price_at_order > 0),
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_services_order_id ON order_services(order_id);
CREATE INDEX IF NOT EXISTS idx_order_services_offering_id ON order_services(service_offering_id);

-- Enable RLS
ALTER TABLE order_services ENABLE ROW LEVEL SECURITY;

-- Clients can read services for their orders
CREATE POLICY "Clients can read own order services"
ON order_services FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_services.order_id
    AND orders.client_id = auth.uid()
  )
);

-- Dealers can read services for their orders
CREATE POLICY "Dealers can read own order services"
ON order_services FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_services.order_id
    AND orders.dealer_id = auth.uid()
  )
);

-- Only system can insert order services (via service function)
CREATE POLICY "System can insert order services"
ON order_services FOR INSERT
WITH CHECK (true);
