-- Function to automatically activate offering when pricing is complete
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

-- Trigger to activate offering when prices are added/updated
CREATE TRIGGER trigger_activate_offering
AFTER INSERT OR UPDATE ON service_prices
FOR EACH ROW
EXECUTE FUNCTION activate_service_offering_if_complete();

-- Function to deactivate offering when prices are deleted
CREATE OR REPLACE FUNCTION deactivate_offering_on_price_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE service_offerings
  SET is_active = false, updated_at = now()
  WHERE id = OLD.service_offering_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to deactivate offering when prices are deleted
CREATE TRIGGER trigger_deactivate_on_price_delete
AFTER DELETE ON service_prices
FOR EACH ROW
EXECUTE FUNCTION deactivate_offering_on_price_delete();

-- Function to calculate order total from order services
CREATE OR REPLACE FUNCTION calculate_order_total(p_order_id uuid)
RETURNS numeric AS $$
DECLARE
  v_total numeric(10,2);
BEGIN
  SELECT COALESCE(SUM(price_at_order), 0)
  INTO v_total
  FROM order_services
  WHERE order_id = p_order_id;
  
  RETURN v_total;
END;
$$ LANGUAGE plpgsql STABLE;
