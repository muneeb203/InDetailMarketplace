-- Force activate all service offerings that have at least one price
-- Run this in Supabase SQL Editor

UPDATE service_offerings
SET is_active = true
WHERE id IN (
  SELECT DISTINCT service_offering_id 
  FROM service_prices
);

-- Check the results
SELECT 
  s.name as service_name,
  so.is_active,
  COUNT(sp.id) as price_count
FROM service_offerings so
JOIN services s ON so.service_id = s.id
LEFT JOIN service_prices sp ON sp.service_offering_id = so.id
GROUP BY s.name, so.is_active
ORDER BY s.name;
