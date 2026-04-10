-- Check if the enum type exists and what values it has
DO $$ 
BEGIN
  -- Add 'detailer' to user_role enum if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'detailer' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'detailer';
  END IF;
END $$;

-- If the enum doesn't exist at all, create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('client', 'detailer', 'admin');
  END IF;
END $$;
