-- Fix orders table to support new service pricing system
-- Make proposed_price nullable since we now use total_price for service-based orders

-- First, drop the NOT NULL constraint on proposed_price
ALTER TABLE orders
ALTER COLUMN proposed_price DROP NOT NULL;

-- Drop any existing price check constraints
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_proposed_price_check;

ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_price_check;

-- Add new constraint: either proposed_price OR total_price must be set
ALTER TABLE orders
ADD CONSTRAINT orders_price_check CHECK (
  (proposed_price IS NOT NULL AND proposed_price > 0) OR
  (total_price IS NOT NULL AND total_price > 0)
);

