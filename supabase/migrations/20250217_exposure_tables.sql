-- dealer_profile_views: track when a dealer profile is viewed
CREATE TABLE IF NOT EXISTS dealer_profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealer_profiles(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dealer_profile_views_dealer_id ON dealer_profile_views(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_profile_views_created_at ON dealer_profile_views(created_at);

ALTER TABLE dealer_profile_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (to track views)
CREATE POLICY "Anyone can insert profile views"
ON dealer_profile_views FOR INSERT TO authenticated
WITH CHECK (true);

-- Dealers can view their own view counts (via RPC or select)
CREATE POLICY "Dealers can view own profile views"
ON dealer_profile_views FOR SELECT TO authenticated
USING (dealer_id = auth.uid());

-- dealer_saves: track when clients save/bookmark a dealer
CREATE TABLE IF NOT EXISTS dealer_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id uuid NOT NULL REFERENCES dealer_profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(dealer_id, client_id)
);

CREATE INDEX IF NOT EXISTS idx_dealer_saves_dealer_id ON dealer_saves(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_saves_created_at ON dealer_saves(created_at);

ALTER TABLE dealer_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can insert own saves"
ON dealer_saves FOR INSERT TO authenticated
WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can delete own saves"
ON dealer_saves FOR DELETE TO authenticated
USING (client_id = auth.uid());

CREATE POLICY "Dealers can view saves on their profile"
ON dealer_saves FOR SELECT TO authenticated
USING (dealer_id = auth.uid());

CREATE POLICY "Clients can view own saves"
ON dealer_saves FOR SELECT TO authenticated
USING (client_id = auth.uid());

-- orders.opened_at: when dealer first opens an order
ALTER TABLE orders ADD COLUMN IF NOT EXISTS opened_at timestamptz;

-- RPC: get public dealer stats (profile views + saves) for display on public profile
CREATE OR REPLACE FUNCTION get_public_dealer_stats(p_dealer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_views bigint;
  v_saves bigint;
BEGIN
  SELECT count(*) INTO v_views FROM dealer_profile_views WHERE dealer_id = p_dealer_id;
  SELECT count(*) INTO v_saves FROM dealer_saves WHERE dealer_id = p_dealer_id;
  RETURN jsonb_build_object('profile_views', coalesce(v_views, 0), 'saves', coalesce(v_saves, 0));
END;
$$;
