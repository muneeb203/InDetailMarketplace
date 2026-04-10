-- Fix RLS policy for dealers updating orders
-- The issue: dealer_id references dealer_profiles(id), but we need to check if the current user
-- is the dealer for this order. Since dealer_profiles.id should match auth.uid() for dealers,
-- this should work, but we need to ensure the policy is correct.

-- Drop existing policy
DROP POLICY IF EXISTS "Dealers can update own orders" ON orders;

-- Recreate with explicit check
CREATE POLICY "Dealers can update own orders"
ON orders FOR UPDATE TO authenticated
USING (
  -- Check if the current user's ID matches the dealer_id in the order
  dealer_id = auth.uid()
)
WITH CHECK (
  -- Ensure the dealer_id doesn't change during update
  dealer_id = auth.uid()
);

-- Also ensure dealer_profiles has proper RLS for updates
-- Drop and recreate the dealer profile update policy to be more explicit
DROP POLICY IF EXISTS "Dealer can update own profile" ON dealer_profiles;

CREATE POLICY "Dealer can update own profile"
ON dealer_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
