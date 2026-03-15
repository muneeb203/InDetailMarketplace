-- TEMPORARY: Disable RLS for development
-- WARNING: Only use this for development/testing
-- Re-enable RLS before going to production

-- Disable RLS on service_offerings temporarily
ALTER TABLE service_offerings DISABLE ROW LEVEL SECURITY;

-- Disable RLS on dealer_profiles temporarily  
ALTER TABLE dealer_profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on service_prices temporarily
ALTER TABLE service_prices DISABLE ROW LEVEL SECURITY;

-- Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('service_offerings', 'dealer_profiles', 'service_prices')
  AND schemaname = 'public';

-- This will allow you to create service offerings without authentication issues
-- Remember to re-enable RLS later with:
-- ALTER TABLE service_offerings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dealer_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE service_prices ENABLE ROW LEVEL SECURITY;