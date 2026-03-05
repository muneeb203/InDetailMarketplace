-- Calculate total price from order services
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
