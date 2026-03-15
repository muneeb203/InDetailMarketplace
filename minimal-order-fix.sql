-- Minimal Order Fix - Just the essentials to fix "Order not found" error

-- Add the marketplace_status column (will show error if already exists, that's OK)
ALTER TABLE orders ADD COLUMN marketplace_status TEXT DEFAULT 'pending_payment';

-- Set all orders to pending_payment status so they can be found by the payment system
UPDATE orders SET marketplace_status = 'pending_payment';

-- Check the results
SELECT COUNT(*) as total_orders, marketplace_status FROM orders GROUP BY marketplace_status;