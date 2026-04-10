-- Allow public/authenticated read of dealer_profiles for marketplace search
-- Required for client-side dealer name search (ilike on business_name)
CREATE POLICY "Public can read dealer profiles"
ON dealer_profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anon can read dealer profiles"
ON dealer_profiles
FOR SELECT
TO anon
USING (true);
