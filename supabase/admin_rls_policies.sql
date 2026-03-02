-- =============================================================================
-- ADMIN RLS POLICIES
-- Run this in Supabase Dashboard > SQL Editor to grant admin full read (and
-- where needed, update) access. Requires that profiles.role can be 'admin'.
-- =============================================================================

-- Helper: use this in USING () for admin check (replace with your schema if different)
-- Admin is any user whose profiles.role = 'admin'

-- ORDERS: admin can SELECT, UPDATE (e.g. cancel/status change)
CREATE POLICY "Admin full access orders"
ON public.orders
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- DEALER_PROFILES: admin can SELECT, UPDATE (e.g. is_verified, is_pro)
CREATE POLICY "Admin full access dealer_profiles"
ON public.dealer_profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- PROFILES: admin can SELECT (read users)
CREATE POLICY "Admin read profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

-- DEALER_REVIEWS: admin read
CREATE POLICY "Admin read dealer_reviews"
ON public.dealer_reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- CONVERSATIONS: admin read
CREATE POLICY "Admin read conversations"
ON public.conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- MESSAGES: admin read (for conversations context)
CREATE POLICY "Admin read messages"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =============================================================================
-- NOTES:
-- 1. If you already have RLS policies on these tables, you may need to add
--    the above as additional policies or adjust existing ones so admin is
--    allowed (e.g. add OR (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))).
-- 2. Ensure at least one user has role = 'admin' in profiles (via Dashboard or SQL).
-- 3. Enable Realtime for orders, conversations, dealer_reviews, profiles if you
--    want live updates in the admin dashboard (Database > Replication).
-- =============================================================================
