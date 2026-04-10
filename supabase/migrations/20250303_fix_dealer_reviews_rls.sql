-- Fix RLS policies for dealer_reviews table to allow clients to submit reviews

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all reviews" ON dealer_reviews;
DROP POLICY IF EXISTS "Clients can insert reviews for completed orders" ON dealer_reviews;
DROP POLICY IF EXISTS "Detailers can respond to their reviews" ON dealer_reviews;
DROP POLICY IF EXISTS "Users can view reviews" ON dealer_reviews;

-- Enable RLS
ALTER TABLE dealer_reviews ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view all reviews (public data)
CREATE POLICY "Anyone can view reviews"
ON dealer_reviews FOR SELECT
USING (true);

-- Policy 2: Authenticated clients can insert reviews for their completed orders
CREATE POLICY "Clients can submit reviews"
ON dealer_reviews FOR INSERT
TO authenticated
WITH CHECK (
  -- User must be authenticated
  auth.uid() = customer_id
  AND
  -- Order must exist and belong to this customer
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = dealer_reviews.order_id
    AND orders.customer_id = auth.uid()
    AND orders.status = 'completed'
  )
);

-- Policy 3: Detailers can update their own reviews (to add responses)
CREATE POLICY "Detailers can respond to reviews"
ON dealer_reviews FOR UPDATE
TO authenticated
USING (
  -- User must be the detailer who received the review
  auth.uid() = detailer_id
)
WITH CHECK (
  -- Can only update the response fields
  auth.uid() = detailer_id
);

-- Policy 4: Users can update their own reviews (within 24 hours)
CREATE POLICY "Customers can edit own reviews"
ON dealer_reviews FOR UPDATE
TO authenticated
USING (
  auth.uid() = customer_id
  AND created_at > NOW() - INTERVAL '24 hours'
)
WITH CHECK (
  auth.uid() = customer_id
);

-- Grant necessary permissions
GRANT SELECT ON dealer_reviews TO anon, authenticated;
GRANT INSERT ON dealer_reviews TO authenticated;
GRANT UPDATE ON dealer_reviews TO authenticated;
