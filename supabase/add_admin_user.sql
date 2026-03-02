-- =============================================================================
-- ADD ADMIN USER (run in Supabase SQL Editor)
-- =============================================================================
-- Prerequisite: Create the auth user first in Supabase Dashboard:
--   Authentication > Users > Add user > Email: admin@gmail.com, Password: 12341234
-- Then run this script.
-- =============================================================================

-- 1) Ensure 'admin' exists in the user_role enum (skip if it already does)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'admin'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE public.user_role ADD VALUE 'admin';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    -- type user_role might not exist; assume it has 'admin' or adjust your type name
    RAISE NOTICE 'user_role type not found or already has admin. Continuing.';
END
$$;

-- 2) Insert or update public.profiles so the admin user has role = 'admin'
--    (uses the auth user id for email = 'admin@gmail.com')
INSERT INTO public.profiles (id, role, name, email, phone, avatar_url, created_at, updated_at)
SELECT
  u.id,
  'admin'::public.user_role,
  'Admin',
  'admin@gmail.com',
  NULL,
  NULL,
  COALESCE(u.created_at, now()),
  now()
FROM auth.users u
WHERE u.email = 'admin@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin'::public.user_role,
  name = 'Admin',
  email = 'admin@gmail.com',
  updated_at = now();

-- 3) Confirm (optional)
SELECT id, role, name, email, created_at
FROM public.profiles
WHERE email = 'admin@gmail.com';
