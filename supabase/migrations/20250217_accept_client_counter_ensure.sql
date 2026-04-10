-- Ensure accept_client_counter exists (in case original migration wasn't applied)
CREATE OR REPLACE FUNCTION public.accept_client_counter(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row orders%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_row FROM orders WHERE id = p_order_id;
  
  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  IF v_row.client_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to accept this order';
  END IF;
  
  IF v_row.status != 'countered' THEN
    RAISE EXCEPTION 'Order is not in countered status (current: %)', v_row.status;
  END IF;
  
  UPDATE orders 
  SET status = 'accepted', 
      agreed_price = COALESCE(v_row.agreed_price, v_row.proposed_price),
      updated_at = now()
  WHERE id = p_order_id;
  
  SELECT * INTO v_row FROM orders WHERE id = p_order_id;
  
  RETURN to_jsonb(v_row);
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_client_counter(uuid) TO authenticated;
