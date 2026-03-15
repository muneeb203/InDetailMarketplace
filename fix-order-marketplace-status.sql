-- Fix Order Marketplace Status Issues
-- This script fixes orders that don't have the correct marketplace_status set

-- Add marketplace_status column if it doesn't exist (will be ignored if it already exists)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS marketplace_status TEXT DEFAULT 'pending_payment';

-- Add other marketplace payment columns if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_total integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_upfront integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_remaining integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS platform_fee integer;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmation_deadline timestamp with time zone;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS auto_release_scheduled boolean DEFAULT false;

-- Update existing orders that don't have marketplace_status set
UPDATE orders 
SET marketplace_status = 'pending_payment'
WHERE marketplace_status IS NULL 
   OR marketplace_status = '';

-- Update orders based on their current status
UPDATE orders 
SET marketplace_status = CASE 
    WHEN status = 'pending' THEN 'pending_payment'
    WHEN status = 'accepted' THEN 'detailer_accepted'
    WHEN status = 'in_progress' THEN 'in_progress'
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'cancelled' THEN 'detailer_rejected'
    ELSE 'pending_payment'
END
WHERE marketplace_status = 'pending_payment' AND status != 'pending';

-- Add indexes for marketplace_status if they don't exist
CREATE INDEX IF NOT EXISTS idx_orders_marketplace_status ON orders(marketplace_status);
CREATE INDEX IF NOT EXISTS idx_orders_confirmation_deadline ON orders(confirmation_deadline);
CREATE INDEX IF NOT EXISTS idx_orders_auto_release_scheduled ON orders(auto_release_scheduled);

-- Show summary of order statuses
SELECT 
    marketplace_status,
    COUNT(*) as count,
    MIN(created_at) as earliest,
    MAX(created_at) as latest
FROM orders 
GROUP BY marketplace_status
ORDER BY count DESC;