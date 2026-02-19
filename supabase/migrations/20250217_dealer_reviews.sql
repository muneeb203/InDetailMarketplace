-- dealer_reviews: client reviews for completed orders
CREATE TABLE IF NOT EXISTS dealer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  dealer_id uuid NOT NULL REFERENCES dealer_profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(order_id)
);

CREATE INDEX IF NOT EXISTS idx_dealer_reviews_dealer_id ON dealer_reviews(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_reviews_order_id ON dealer_reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_dealer_reviews_created_at ON dealer_reviews(created_at DESC);

ALTER TABLE dealer_reviews ENABLE ROW LEVEL SECURITY;

-- Clients can insert their own reviews (for their orders)
CREATE POLICY "Clients can insert own reviews"
ON dealer_reviews FOR INSERT TO authenticated
WITH CHECK (client_id = auth.uid());

-- Clients can view their own reviews
CREATE POLICY "Clients can view own reviews"
ON dealer_reviews FOR SELECT TO authenticated
USING (client_id = auth.uid());

-- Dealers can view reviews for their profile
CREATE POLICY "Dealers can view own reviews"
ON dealer_reviews FOR SELECT TO authenticated
USING (dealer_id = auth.uid());

-- Public can read reviews (for gig page display)
CREATE POLICY "Public can read dealer reviews"
ON dealer_reviews FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Anon can read dealer reviews"
ON dealer_reviews FOR SELECT TO anon
USING (true);

-- Add rating and review_count to dealer_profiles if not exist
ALTER TABLE dealer_profiles
ADD COLUMN IF NOT EXISTS rating numeric(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;

-- Trigger: update dealer_profiles.rating and review_count when dealer_reviews change
CREATE OR REPLACE FUNCTION update_dealer_rating_on_review()
RETURNS TRIGGER AS $$
DECLARE
  v_dealer_id uuid;
  v_avg numeric;
  v_count bigint;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_dealer_id := OLD.dealer_id;
  ELSE
    v_dealer_id := NEW.dealer_id;
  END IF;

  SELECT COALESCE(AVG(rating)::numeric(3,2), 0), COUNT(*)
  INTO v_avg, v_count
  FROM dealer_reviews
  WHERE dealer_id = v_dealer_id;

  UPDATE dealer_profiles
  SET rating = v_avg,
      review_count = v_count
  WHERE id = v_dealer_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dealer_reviews_update_rating ON dealer_reviews;
CREATE TRIGGER dealer_reviews_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON dealer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_dealer_rating_on_review();
