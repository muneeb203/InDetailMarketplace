-- Fix orders INSERT RLS policy to ensure clients can create orders
-- This migration ensures the RLS policy is correctly configured

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Clients can insert orders" ON orders;

-- Recreate INSERT policy with proper checks
CREATE POLICY "Clients can insert orders"
ON orders FOR INSERT TO authenticated
WITH CHECK (
  client_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid()
  )
);

-- Also ensure the SELECT policy allows clients to see their orders immediately after creation
DROP POLICY IF EXISTS "Clients can view own orders" ON orders;

CREATE POLICY "Clients can view own orders"
ON orders FOR SELECT TO authenticated
USING (
  client_id = auth.uid()
);

-- Verify RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT INSERT ON orders TO authenticated;
GRANT SELECT ON orders TO authenticated;
GRANT UPDATE ON orders TO authenticated;
