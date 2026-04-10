-- dealer_social_links: one URL per platform per dealer
CREATE TABLE IF NOT EXISTS dealer_social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealer_profiles(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'facebook')),
  url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(dealer_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_dealer_social_links_dealer_id ON dealer_social_links(dealer_id);

ALTER TABLE dealer_social_links ENABLE ROW LEVEL SECURITY;

-- Dealers can manage their own links
CREATE POLICY "Dealers can manage own social links"
ON dealer_social_links FOR ALL TO authenticated
USING (dealer_id = auth.uid())
WITH CHECK (dealer_id = auth.uid());

-- Public can read (for gig page display) - authenticated and anon
CREATE POLICY "Public can read dealer social links"
ON dealer_social_links FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Anon can read dealer social links"
ON dealer_social_links FOR SELECT TO anon
USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_dealer_social_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dealer_social_links_updated_at ON dealer_social_links;
CREATE TRIGGER dealer_social_links_updated_at
  BEFORE UPDATE ON dealer_social_links
  FOR EACH ROW
  EXECUTE FUNCTION update_dealer_social_links_updated_at();
