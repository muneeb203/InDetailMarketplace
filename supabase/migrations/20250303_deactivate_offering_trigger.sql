-- Deactivate offering when prices are deleted
CREATE OR REPLACE FUNCTION deactivate_offering_on_price_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE service_offerings
  SET is_active = false, updated_at = now()
  WHERE id = OLD.service_offering_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on service_prices DELETE
DROP TRIGGER IF EXISTS trigger_deactivate_on_price_delete ON service_prices;
CREATE TRIGGER trigger_deactivate_on_price_delete
AFTER DELETE ON service_prices
FOR EACH ROW
EXECUTE FUNCTION deactivate_offering_on_price_delete();
