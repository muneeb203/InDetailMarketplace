-- Add sample prices for existing service offerings
-- This script adds prices for service offerings that don't have prices yet

-- First, let's add prices for all active service offerings
-- We'll use a reasonable price structure based on vehicle categories

DO $$
DECLARE
  offering_record RECORD;
  sedan_cat_id UUID;
  suv_cat_id UUID;
  truck_cat_id UUID;
  luxury_cat_id UUID;
  exotic_cat_id UUID;
BEGIN
  -- Get vehicle category IDs
  SELECT id INTO sedan_cat_id FROM vehicle_categories WHERE name = 'Sedan' LIMIT 1;
  SELECT id INTO suv_cat_id FROM vehicle_categories WHERE name = 'SUV' LIMIT 1;
  SELECT id INTO truck_cat_id FROM vehicle_categories WHERE name = 'Truck' LIMIT 1;
  SELECT id INTO luxury_cat_id FROM vehicle_categories WHERE name = 'Luxury' LIMIT 1;
  SELECT id INTO exotic_cat_id FROM vehicle_categories WHERE name = 'Exotic' LIMIT 1;

  -- Loop through all service offerings that don't have complete pricing
  FOR offering_record IN 
    SELECT so.id, so.pricing_model, s.name as service_name
    FROM service_offerings so
    JOIN services s ON so.service_id = s.id
    WHERE so.is_active = false  -- These are inactive because pricing isn't complete
  LOOP
    -- Delete any existing prices for this offering
    DELETE FROM service_prices WHERE service_offering_id = offering_record.id;

    -- Add prices based on service type and pricing model
    IF offering_record.pricing_model = 'single' THEN
      -- Single price for all vehicle types
      INSERT INTO service_prices (service_offering_id, vehicle_category_id, price)
      VALUES (offering_record.id, sedan_cat_id, 
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
    ELSE
      -- Multi-tier pricing based on vehicle category
      INSERT INTO service_prices (service_offering_id, vehicle_category_id, price)
      VALUES 
        (offering_record.id, sedan_cat_id, 
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
        ),
        (offering_record.id, suv_cat_id, 
          CASE offering_record.service_name
            WHEN 'Full Detail' THEN 180.00
            WHEN 'Ceramic Coating' THEN 950.00
            WHEN 'Paint Correction' THEN 600.00
            WHEN 'Interior Detailing' THEN 120.00
            WHEN 'Exterior Wash' THEN 50.00
            WHEN 'Wax & Polish' THEN 95.00
            WHEN 'Engine Bay Cleaning' THEN 70.00
            WHEN 'Headlight Restoration' THEN 75.00
            WHEN 'PPF Installation' THEN 1400.00
            WHEN 'Window Tinting' THEN 350.00
            WHEN 'Scratch Removal' THEN 180.00
            WHEN 'Odor Removal' THEN 140.00
            WHEN 'Leather Conditioning' THEN 110.00
            WHEN 'Clay Bar Treatment' THEN 85.00
            WHEN 'Wheel Detailing' THEN 60.00
            WHEN 'Undercarriage Wash' THEN 55.00
            WHEN 'Pet Hair Removal' THEN 95.00
            WHEN 'Convertible Top Care' THEN 120.00
            ELSE 120.00
          END
        ),
        (offering_record.id, truck_cat_id, 
          CASE offering_record.service_name
            WHEN 'Full Detail' THEN 200.00
            WHEN 'Ceramic Coating' THEN 1000.00
            WHEN 'Paint Correction' THEN 650.00
            WHEN 'Interior Detailing' THEN 130.00
            WHEN 'Exterior Wash' THEN 55.00
            WHEN 'Wax & Polish' THEN 100.00
            WHEN 'Engine Bay Cleaning' THEN 75.00
            WHEN 'Headlight Restoration' THEN 75.00
            WHEN 'PPF Installation' THEN 1500.00
            WHEN 'Window Tinting' THEN 300.00
            WHEN 'Scratch Removal' THEN 200.00
            WHEN 'Odor Removal' THEN 150.00
            WHEN 'Leather Conditioning' THEN 120.00
            WHEN 'Clay Bar Treatment' THEN 90.00
            WHEN 'Wheel Detailing' THEN 70.00
            WHEN 'Undercarriage Wash' THEN 65.00
            WHEN 'Pet Hair Removal' THEN 100.00
            WHEN 'Convertible Top Care' THEN 130.00
            ELSE 130.00
          END
        ),
        (offering_record.id, luxury_cat_id, 
          CASE offering_record.service_name
            WHEN 'Full Detail' THEN 250.00
            WHEN 'Ceramic Coating' THEN 1200.00
            WHEN 'Paint Correction' THEN 750.00
            WHEN 'Interior Detailing' THEN 150.00
            WHEN 'Exterior Wash' THEN 60.00
            WHEN 'Wax & Polish' THEN 120.00
            WHEN 'Engine Bay Cleaning' THEN 85.00
            WHEN 'Headlight Restoration' THEN 90.00
            WHEN 'PPF Installation' THEN 1800.00
            WHEN 'Window Tinting' THEN 400.00
            WHEN 'Scratch Removal' THEN 250.00
            WHEN 'Odor Removal' THEN 180.00
            WHEN 'Leather Conditioning' THEN 140.00
            WHEN 'Clay Bar Treatment' THEN 110.00
            WHEN 'Wheel Detailing' THEN 80.00
            WHEN 'Undercarriage Wash' THEN 70.00
            WHEN 'Pet Hair Removal' THEN 120.00
            WHEN 'Convertible Top Care' THEN 150.00
            ELSE 150.00
          END
        ),
        (offering_record.id, exotic_cat_id, 
          CASE offering_record.service_name
            WHEN 'Full Detail' THEN 350.00
            WHEN 'Ceramic Coating' THEN 1500.00
            WHEN 'Paint Correction' THEN 1000.00
            WHEN 'Interior Detailing' THEN 200.00
            WHEN 'Exterior Wash' THEN 80.00
            WHEN 'Wax & Polish' THEN 150.00
            WHEN 'Engine Bay Cleaning' THEN 100.00
            WHEN 'Headlight Restoration' THEN 100.00
            WHEN 'PPF Installation' THEN 2500.00
            WHEN 'Window Tinting' THEN 500.00
            WHEN 'Scratch Removal' THEN 350.00
            WHEN 'Odor Removal' THEN 250.00
            WHEN 'Leather Conditioning' THEN 180.00
            WHEN 'Clay Bar Treatment' THEN 140.00
            WHEN 'Wheel Detailing' THEN 100.00
            WHEN 'Undercarriage Wash' THEN 90.00
            WHEN 'Pet Hair Removal' THEN 150.00
            WHEN 'Convertible Top Care' THEN 200.00
            ELSE 200.00
          END
        );
    END IF;
  END LOOP;

  RAISE NOTICE 'Sample prices added successfully';
END $$;
