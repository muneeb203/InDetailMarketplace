-- Check if prices were added and offerings are active
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check all service offerings and their status
SELECT 
  so.id,
  s.name as service_name,
  so.dealer_id,
  so.pricing_model,
  so.is_active,
  COUNT(sp.id) as price_count
FROM service_offerings so
JOIN services s ON so.service_id = s.id
LEFT JOIN service_prices sp ON sp.service_offering_id = so.id
GROUP BY so.id, s.name, so.dealer_id, so.pricing_model, so.is_active
ORDER BY s.name;

-- 2. Check all prices
SELECT 
  s.name as service_name,
  vc.name as vehicle_category,
  sp.price
FROM service_prices sp
JOIN service_offerings so ON sp.service_offering_id = so.id
JOIN services s ON so.service_id = s.id
JOIN vehicle_categories vc ON sp.vehicle_category_id = vc.id
ORDER BY s.name, vc.name;

-- 3. Check vehicle categories
SELECT * FROM vehicle_categories;
