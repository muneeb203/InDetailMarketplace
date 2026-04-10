-- Seed predefined service catalog (15-20 common detailing services)
INSERT INTO services (name, description, is_predefined, dealer_id) VALUES
  ('Full Detail', 'Complete interior and exterior detailing service including wash, wax, vacuum, and polish', true, NULL),
  ('Ceramic Coating', 'Professional ceramic coating application for long-lasting paint protection', true, NULL),
  ('Paint Correction', 'Multi-stage paint correction to remove swirls, scratches, and imperfections', true, NULL),
  ('Interior Detailing', 'Deep cleaning of interior surfaces, upholstery, carpets, and dashboard', true, NULL),
  ('Exterior Wash', 'Thorough hand wash and dry of vehicle exterior', true, NULL),
  ('Wax & Polish', 'Hand wax application and paint polishing for enhanced shine', true, NULL),
  ('Engine Bay Cleaning', 'Detailed cleaning and degreasing of engine compartment', true, NULL),
  ('Headlight Restoration', 'Restore clarity to foggy or yellowed headlight lenses', true, NULL),
  ('PPF Installation', 'Paint Protection Film installation for high-impact areas', true, NULL),
  ('Window Tinting', 'Professional window tint application for UV protection and privacy', true, NULL),
  ('Scratch Removal', 'Targeted scratch and scuff removal from paint surfaces', true, NULL),
  ('Odor Removal', 'Deep cleaning and ozone treatment to eliminate persistent odors', true, NULL),
  ('Leather Conditioning', 'Professional leather cleaning and conditioning treatment', true, NULL),
  ('Clay Bar Treatment', 'Clay bar application to remove embedded contaminants from paint', true, NULL),
  ('Wheel Detailing', 'Deep cleaning and protection of wheels, tires, and wheel wells', true, NULL),
  ('Undercarriage Wash', 'Thorough cleaning of vehicle undercarriage and chassis', true, NULL),
  ('Pet Hair Removal', 'Specialized removal of pet hair from interior surfaces', true, NULL),
  ('Convertible Top Care', 'Cleaning and protection treatment for convertible tops', true, NULL)
ON CONFLICT (name) WHERE is_predefined = true DO NOTHING;
