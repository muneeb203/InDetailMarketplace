-- Add new columns to existing orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS vehicle_category_id uuid REFERENCES vehicle_categories(id),
ADD COLUMN IF NOT EXISTS total_price numeric(10,2);

-- Update check constraint to allow null proposed_price when using service pricing
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_proposed_price_check;

ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_price_check;

ALTER TABLE orders
ADD CONSTRAINT orders_price_check CHECK (
  (proposed_price IS NOT NULL AND proposed_price > 0) OR
  (total_price IS NOT NULL AND total_price > 0)
);

-- Create index on vehicle_category_id
CREATE INDEX IF NOT EXISTS idx_orders_vehicle_category ON orders(vehicle_category_id);
