-- RPC for client to reject/cancel a countered offer (bypasses RLS)
-- Ensures only the order's client can reject, and only when status is 'countered'
CREATE OR REPLACE FUNCTION client_reject_order(p_order_id uuid)
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
    RAISE EXCEPTION 'Not authorized to reject this order';
  END IF;
  
  IF v_row.status NOT IN ('pending', 'countered') THEN
    RAISE EXCEPTION 'Order cannot be cancelled (current status: %)', v_row.status;
  END IF;
  
  UPDATE orders 
  SET status = 'rejected', 
      updated_at = now()
  WHERE id = p_order_id;
  
  SELECT * INTO v_row FROM orders WHERE id = p_order_id;
  
  RETURN to_jsonb(v_row);
END;
$$;

GRANT EXECUTE ON FUNCTION client_reject_order(uuid) TO authenticated;
