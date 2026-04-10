-- Automatically activate offering when pricing is complete
CREATE OR REPLACE FUNCTION activate_service_offering_if_complete()
RETURNS TRIGGER AS $$
DECLARE
  v_pricing_model text;
  v_price_count integer;
  v_category_count integer;
BEGIN
  -- Get offering details
  SELECT pricing_model INTO v_pricing_model
  FROM service_offerings
  WHERE id = NEW.service_offering_id;
  
  -- Count prices for this offering
  SELECT COUNT(*) INTO v_price_count
  FROM service_prices
  WHERE service_offering_id = NEW.service_offering_id;
  
  -- Count total vehicle categories
  SELECT COUNT(*) INTO v_category_count
  FROM vehicle_categories;
  
  -- Activate if conditions met
  IF (v_pricing_model = 'single' AND v_price_count >= 1) OR
     (v_pricing_model = 'multi-tier' AND v_price_count = v_category_count) THEN
    UPDATE service_offerings
    SET is_active = true, updated_at = now()
    WHERE id = NEW.service_offering_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on service_prices INSERT/UPDATE
DROP TRIGGER IF EXISTS trigger_activate_offering ON service_prices;
CREATE TRIGGER trigger_activate_offering
AFTER INSERT OR UPDATE ON service_prices
FOR EACH ROW
EXECUTE FUNCTION activate_service_offering_if_complete();
