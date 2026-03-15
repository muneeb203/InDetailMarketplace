-- Run this in Supabase SQL Editor to create the required tables

-- Create enum for marketplace order status
DO $$ BEGIN
  CREATE TYPE marketplace_order_status AS ENUM (
    'pending_payment',      -- Client initiated booking, payment pending
    'paid',                 -- Payment captured, funds in escrow
    'detailer_notified',    -- Detailer notified of job
    'detailer_accepted',    -- Detailer accepted, 15% paid out
    'detailer_rejected',    -- Detailer rejected, full refund
    'in_progress',          -- Job in progress
    'detailer_marked_done', -- Detailer marked complete, awaiting client confirmation
    'client_confirmed',     -- Client confirmed, 85% paid out
    'auto_confirmed',       -- Auto-confirmed after timeout, 85% paid out
    'completed',            -- Job fully completed
    'disputed'              -- Payment disputed
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Stripe Connected Accounts table
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