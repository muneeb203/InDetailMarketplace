-- Fix: Trigger runs as invoking user (client), so UPDATE on dealer_profiles fails due to RLS.
-- Make the function SECURITY DEFINER so it can update dealer_profiles.
CREATE OR REPLACE FUNCTION update_dealer_rating_on_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0), COUNT(*)::bigint
  INTO v_avg, v_count
  FROM dealer_reviews
  WHERE dealer_id = v_dealer_id;

  UPDATE dealer_profiles
  SET rating = v_avg,
      review_count = v_count::integer
  WHERE id = v_dealer_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Backfill: update dealer_profiles for dealers who already have reviews
UPDATE dealer_profiles dp
SET 
  rating = COALESCE(sub.avg_rating, 0),
  review_count = COALESCE(sub.cnt, 0)
FROM (
  SELECT dealer_id, ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(*)::integer AS cnt
  FROM dealer_reviews
  GROUP BY dealer_id
) sub
WHERE dp.id = sub.dealer_id;
