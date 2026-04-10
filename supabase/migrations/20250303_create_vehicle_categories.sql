-- Create vehicle_categories table
CREATE TABLE IF NOT EXISTS vehicle_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  display_order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Seed vehicle categories
INSERT INTO vehicle_categories (name, description, display_order) VALUES
  ('Motorcycle/Bike', 'Motorcycles and bikes', 1),
  ('Small Car', '2-4 seats, compact', 2),
  ('Medium Car', '5 seats, sedan', 3),
  ('Large Car', '6-7 seats, SUV/Van', 4),
  ('Truck/Commercial Vehicle', 'Trucks and commercial vehicles', 5)
ON CONFLICT (name) DO NOTHING;

-- Create index on display_order for sorting
CREATE INDEX IF NOT EXISTS idx_vehicle_categories_display_order ON vehicle_categories(display_order);

-- Enable RLS
ALTER TABLE vehicle_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read vehicle categories"
ON vehicle_categories FOR SELECT
TO authenticated, anon
USING (true);
