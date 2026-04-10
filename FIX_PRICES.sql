-- Quick fix to add prices to all service offerings
-- Run this in your Supabase SQL Editor

-- This will add sample prices for all service offerings that are currently inactive due to missing prices

DO $$
DECLARE
  offering_record RECORD;
  cat_id UUID;
BEGIN
  -- Get the first vehicle category (we'll use single pricing for simplicity)
  SELECT id INTO cat_id FROM vehicle_categories LIMIT 1;

  -- Loop through all service offerings
  FOR offering_record IN 
    SELECT so.id, s.name as service_name
    FROM service_offerings so
    JOIN services s ON so.service_id = s.id
  LOOP
    -- Check if this offering already has prices
    IF NOT EXISTS (SELECT 1 FROM service_prices WHERE service_offering_id = offering_record.id) THEN
      -- Add a single price for this offering
      INSERT INTO service_prices (service_offering_id, vehicle_category_id, price)
      VALUES (offering_record.id, cat_id, 
        CASE offering_record.service_name
          WHEN 'Full Detail' THEN 150.00
          WHEN 'Ceramic Coating' THEN 800.00
          WHEN 'Paint Correction' THEN 500.00
          WHEN 'Interior Detailing' THEN 100.00
          WHEN 'Exterior Wash' THEN 40.00
          WHEN 'Wax & Polish' THEN 80.00
          WHEN 'Engine Bay Cleaning' THEN 60.00
          WHEN 'Headlight Restoration' THEN 75.00
          WHEN 'PPF Installation' THEN 1200.00
          WHEN 'Window Tinting' THEN 300.00
          WHEN 'Scratch Removal' THEN 150.00
          WHEN 'Odor Removal' THEN 120.00
          WHEN 'Leather Conditioning' THEN 90.00
          WHEN 'Clay Bar Treatment' THEN 70.00
          WHEN 'Wheel Detailing' THEN 50.00
          WHEN 'Undercarriage Wash' THEN 45.00
          WHEN 'Pet Hair Removal' THEN 80.00
          WHEN 'Convertible Top Care' THEN 100.00
          ELSE 100.00
        END
      );
      
      RAISE NOTICE 'Added price for: %', offering_record.service_name;
    END IF;
  END LOOP;

  -- Now activate all offerings that have prices
  UPDATE service_offerings
  SET is_active = true
  WHERE id IN (
    SELECT DISTINCT service_offering_id 
    FROM service_prices
  );

  RAISE NOTICE 'Prices added and offerings activated!';
END $$;

-- Verify the results
SELECT 
  s.name as service_name,
  so.pricing_model,
  so.is_active,
  COUNT(sp.id) as price_count,
  MIN(sp.price) as min_price,
  MAX(sp.price) as max_price
FROM service_offerings so
JOIN services s ON so.service_id = s.id
LEFT JOIN service_prices sp ON sp.service_offering_id = so.id
GROUP BY s.name, so.pricing_model, so.is_active
ORDER BY s.name;
