# Create Database Table for Stripe Connect

## Quick Fix: Create the Missing Table

The Stripe Connect setup is failing because the `stripe_connected_accounts` table doesn't exist in your Supabase database.

### Option 1: Create Table via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `dzuhcmccxfouiqqttvjz`
3. Go to **SQL Editor** in the left sidebar
4. Copy and paste this SQL:

```sql
-- Create the stripe_connected_accounts table
CREATE TABLE IF NOT EXISTS stripe_connected_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detailer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_account_id text NOT NULL UNIQUE,
  account_status text NOT NULL DEFAULT 'pending' CHECK (account_status IN ('pending', 'active', 'restricted', 'rejected')),
  capabilities_enabled boolean DEFAULT false,
  payouts_enabled boolean DEFAULT false,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stripe_connected_accounts_detailer_id ON stripe_connected_accounts(detailer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_connected_accounts_stripe_account_id ON stripe_connected_accounts(stripe_account_id);

-- Enable RLS
ALTER TABLE stripe_connected_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Detailers can view own connected accounts"
ON stripe_connected_accounts FOR SELECT TO authenticated
USING (detailer_id = auth.uid());

CREATE POLICY "Detailers can insert own connected accounts"
ON stripe_connected_accounts FOR INSERT TO authenticated
WITH CHECK (detailer_id = auth.uid());

CREATE POLICY "Detailers can update own connected accounts"
ON stripe_connected_accounts FOR UPDATE TO authenticated
USING (detailer_id = auth.uid())
WITH CHECK (detailer_id = auth.uid());
```

5. Click **Run** to execute the SQL

### Option 2: Use the Temporary LocalStorage Solution

If you can't create the table right now, the app will automatically fall back to using localStorage for development. This allows you to test the Stripe Connect flow without the database table.

## After Creating the Table

1. Refresh your app
2. Go to Detailer Settings → Payments tab
3. Try creating a Stripe Connect account again
4. It should now work without errors

## Verification

To verify the table was created successfully:

1. In Supabase Dashboard, go to **Table Editor**
2. You should see `stripe_connected_accounts` in the list of tables
3. The table should have the columns: `id`, `detailer_id`, `stripe_account_id`, `account_status`, etc.

## Next Steps

Once the table is created, the Stripe Connect setup will work properly and store real data in your database instead of using localStorage.