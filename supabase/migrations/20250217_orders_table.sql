-- Orders table for marketplace service requests
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid NOT NULL REFERENCES dealer_profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dealer_id uuid NOT NULL REFERENCES dealer_profiles(id) ON DELETE CASCADE,
  proposed_price numeric(10,2) NOT NULL CHECK (proposed_price > 0),
  agreed_price numeric(10,2),
  notes text,
  scheduled_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'countered', 'accepted', 'rejected', 'paid', 'in_progress', 'completed'
  )),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_dealer_id ON orders(dealer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Clients can view their own orders
CREATE POLICY "Clients can view own orders"
ON orders FOR SELECT TO authenticated
USING (client_id = auth.uid());

-- Clients can insert orders (as client)
CREATE POLICY "Clients can insert orders"
ON orders FOR INSERT TO authenticated
WITH CHECK (client_id = auth.uid());

-- Clients can update own orders only for allowed transitions (countered -> accepted/rejected via cancel)
CREATE POLICY "Clients can update own countered orders"
ON orders FOR UPDATE TO authenticated
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());

-- Dealers can view their orders
CREATE POLICY "Dealers can view own orders"
ON orders FOR SELECT TO authenticated
USING (dealer_id = auth.uid());

-- Dealers can update their orders (accept, reject, counter, progress)
CREATE POLICY "Dealers can update own orders"
ON orders FOR UPDATE TO authenticated
USING (dealer_id = auth.uid())
WITH CHECK (dealer_id = auth.uid());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();
