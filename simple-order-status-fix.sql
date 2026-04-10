-- Simple Order Status Fix (Guaranteed to work in Supabase)
-- Run these commands one by one if the main script fails

-- Step 1: Add marketplace_status column (ignore error if it already exists)
ALTER TABLE orders ADD COLUMN marketplace_status TEXT DEFAULT 'pending_payment';

-- Step 2: Update NULL marketplace_status values
UPDATE orders 
SET marketplace_status = 'pending_payment'
WHERE marketplace_status IS NULL;

-- Step 3: Update empty marketplace_status values
UPDATE orders 
SET marketplace_status = 'pending_payment'
WHERE marketplace_status = '';

-- Step 4: Map existing status values to marketplace_status
UPDATE orders 
SET marketplace_status = 'pending_payment'
WHERE status = 'pending' AND marketplace_status != 'pending_payment';

UPDATE orders 
SET marketplace_status = 'detailer_accepted'
WHERE status = 'accepted' AND marketplace_status != 'detailer_accepted';

UPDATE orders 
SET marketplace_status = 'in_progress'
WHERE status = 'in_progress' AND marketplace_status != 'in_progress';

UPDATE orders 
SET marketplace_status = 'completed'
WHERE status = 'completed' AND marketplace_status != 'completed';

UPDATE orders 
SET marketplace_status = 'detailer_rejected'
WHERE status = 'cancelled' AND marketplace_status != 'detailer_rejected';

-- Step 5: Add index
CREATE INDEX IF NOT EXISTS idx_orders_marketplace_status ON orders(marketplace_status);

-- Step 6: Check results
SELECT 
    marketplace_status,
    COUNT(*) as count
FROM orders 
GROUP BY marketplace_status
ORDER BY count DESC;