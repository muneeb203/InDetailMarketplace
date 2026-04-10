-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  is_predefined boolean NOT NULL DEFAULT false,
  dealer_id uuid REFERENCES dealer_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT custom_service_has_dealer CHECK (
    (is_predefined = true AND dealer_id IS NULL) OR
    (is_predefined = false AND dealer_id IS NOT NULL)
  )
);

-- Create partial unique index for predefined service names
CREATE UNIQUE INDEX IF NOT EXISTS idx_services_unique_predefined_name 
ON services(name) WHERE is_predefined = true;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_services_dealer_id ON services(dealer_id);
CREATE INDEX IF NOT EXISTS idx_services_is_predefined ON services(is_predefined);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Anyone can read predefined services
CREATE POLICY "Public can read predefined services"
ON services FOR SELECT
USING (is_predefined = true);

-- Dealers can read their own custom services
CREATE POLICY "Dealers can read own custom services"
ON services FOR SELECT
USING (dealer_id = auth.uid());

-- Dealers can create custom services
CREATE POLICY "Dealers can create custom services"
ON services FOR INSERT
WITH CHECK (dealer_id = auth.uid() AND is_predefined = false);

-- Dealers can update their own custom services
CREATE POLICY "Dealers can update own custom services"
ON services FOR UPDATE
USING (dealer_id = auth.uid() AND is_predefined = false);

-- Dealers can delete their own custom services
CREATE POLICY "Dealers can delete own custom services"
ON services FOR DELETE
USING (dealer_id = auth.uid() AND is_predefined = false);
