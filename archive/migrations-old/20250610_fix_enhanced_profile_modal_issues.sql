-- Fix Enhanced Profile Modal Issues Migration
-- Addresses: profile pictures, sex field, smoking details, Dutch cities, and RLS fixes

-- Add missing fields to tenant_profiles table
ALTER TABLE tenant_profiles 
ADD COLUMN IF NOT EXISTS sex TEXT CHECK (sex IN ('man', 'vrouw', 'anders', 'zeg_ik_liever_niet')),
ADD COLUMN IF NOT EXISTS smoking_details TEXT;

-- Create profile pictures storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'profile-pictures', 
  'profile-pictures', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create comprehensive Dutch cities and neighborhoods table
CREATE TABLE IF NOT EXISTS dutch_cities_neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT NOT NULL,
  province TEXT NOT NULL,
  neighborhood_name TEXT NOT NULL,
  postal_code_prefix TEXT, -- First 4 digits of postal code
  population INTEGER,
  is_major_city BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert comprehensive Dutch cities and neighborhoods data
INSERT INTO dutch_cities_neighborhoods (city_name, province, neighborhood_name, postal_code_prefix, is_major_city) VALUES
-- Amsterdam
('Amsterdam', 'Noord-Holland', 'Centrum', '1012', true),
('Amsterdam', 'Noord-Holland', 'Jordaan', '1016', true),
('Amsterdam', 'Noord-Holland', 'Oud-Zuid', '1071', true),
('Amsterdam', 'Noord-Holland', 'Oud-West', '1054', true),
('Amsterdam', 'Noord-Holland', 'Noord', '1031', true),
('Amsterdam', 'Noord-Holland', 'Oost', '1091', true),
('Amsterdam', 'Noord-Holland', 'West', '1051', true),
('Amsterdam', 'Noord-Holland', 'Zuid', '1077', true),
('Amsterdam', 'Noord-Holland', 'Zuidoost', '1102', true),
('Amsterdam', 'Noord-Holland', 'De Pijp', '1073', true),
('Amsterdam', 'Noord-Holland', 'Vondelpark', '1054', true),
('Amsterdam', 'Noord-Holland', 'Museumkwartier', '1071', true),

-- Rotterdam
('Rotterdam', 'Zuid-Holland', 'Centrum', '3011', true),
('Rotterdam', 'Zuid-Holland', 'Noord', '3038', true),
('Rotterdam', 'Zuid-Holland', 'Delfshaven', '3024', true),
('Rotterdam', 'Zuid-Holland', 'Overschie', '3044', true),
('Rotterdam', 'Zuid-Holland', 'Hillegersberg-Schiebroek', '3054', true),
('Rotterdam', 'Zuid-Holland', 'Kralingen-Crooswijk', '3063', true),
('Rotterdam', 'Zuid-Holland', 'Feijenoord', '3071', true),
('Rotterdam', 'Zuid-Holland', 'IJsselmonde', '3078', true),
('Rotterdam', 'Zuid-Holland', 'Pernis', '3195', true),
('Rotterdam', 'Zuid-Holland', 'Prins Alexander', '3067', true),

-- Den Haag
('Den Haag', 'Zuid-Holland', 'Centrum', '2511', true),
('Den Haag', 'Zuid-Holland', 'Scheveningen', '2584', true),
('Den Haag', 'Zuid-Holland', 'Bezuidenhout', '2594', true),
('Den Haag', 'Zuid-Holland', 'Haagse Hout', '2566', true),
('Den Haag', 'Zuid-Holland', 'Laak', '2521', true),
('Den Haag', 'Zuid-Holland', 'Leidschenveen-Ypenburg', '2492', true),
('Den Haag', 'Zuid-Holland', 'Loosduinen', '2551', true),
('Den Haag', 'Zuid-Holland', 'Segbroek', '2563', true),
('Den Haag', 'Zuid-Holland', 'Escamp', '2531', true),

-- Utrecht
('Utrecht', 'Utrecht', 'Centrum', '3511', true),
('Utrecht', 'Utrecht', 'Noord', '3561', true),
('Utrecht', 'Utrecht', 'Oost', '3581', true),
('Utrecht', 'Utrecht', 'West', '3531', true),
('Utrecht', 'Utrecht', 'Zuid', '3521', true),
('Utrecht', 'Utrecht', 'Nieuwegein', '3430', true),
('Utrecht', 'Utrecht', 'Vleuten-De Meern', '3451', true),
('Utrecht', 'Utrecht', 'Zuilen', '3544', true),
('Utrecht', 'Utrecht', 'Overvecht', '3561', true),
('Utrecht', 'Utrecht', 'Kanaleneiland', '3526', true),

-- Eindhoven
('Eindhoven', 'Noord-Brabant', 'Centrum', '5611', true),
('Eindhoven', 'Noord-Brabant', 'Noord', '5641', true),
('Eindhoven', 'Noord-Brabant', 'Oost', '5631', true),
('Eindhoven', 'Noord-Brabant', 'West', '5651', true),
('Eindhoven', 'Noord-Brabant', 'Zuid', '5621', true),
('Eindhoven', 'Noord-Brabant', 'Woensel', '5641', true),
('Eindhoven', 'Noord-Brabant', 'Stratum', '5611', true),
('Eindhoven', 'Noord-Brabant', 'Gestel', '5615', true),
('Eindhoven', 'Noord-Brabant', 'Strijp', '5616', true),

-- Groningen
('Groningen', 'Groningen', 'Centrum', '9711', true),
('Groningen', 'Groningen', 'Noord', '9741', true),
('Groningen', 'Groningen', 'Oost', '9721', true),
('Groningen', 'Groningen', 'West', '9751', true),
('Groningen', 'Groningen', 'Zuid', '9731', true),
('Groningen', 'Groningen', 'Paddepoel', '9742', true),
('Groningen', 'Groningen', 'Vinkhuizen', '9743', true),

-- Additional major cities
('Tilburg', 'Noord-Brabant', 'Centrum', '5011', true),
('Tilburg', 'Noord-Brabant', 'Noord', '5041', true),
('Tilburg', 'Noord-Brabant', 'Oost', '5021', true),
('Tilburg', 'Noord-Brabant', 'West', '5051', true),
('Tilburg', 'Noord-Brabant', 'Zuid', '5031', true),

('Almere', 'Flevoland', 'Centrum', '1315', true),
('Almere', 'Flevoland', 'Haven', '1357', true),
('Almere', 'Flevoland', 'Stad', '1321', true),
('Almere', 'Flevoland', 'Buiten', '1358', true),
('Almere', 'Flevoland', 'Poort', '1363', true),

('Breda', 'Noord-Brabant', 'Centrum', '4811', true),
('Breda', 'Noord-Brabant', 'Noord', '4834', true),
('Breda', 'Noord-Brabant', 'Oost', '4824', true),
('Breda', 'Noord-Brabant', 'West', '4841', true),
('Breda', 'Noord-Brabant', 'Zuid', '4816', true),

('Nijmegen', 'Gelderland', 'Centrum', '6511', true),
('Nijmegen', 'Gelderland', 'Noord', '6541', true),
('Nijmegen', 'Gelderland', 'Oost', '6521', true),
('Nijmegen', 'Gelderland', 'West', '6531', true),
('Nijmegen', 'Gelderland', 'Zuid', '6561', true),

('Apeldoorn', 'Gelderland', 'Centrum', '7311', true),
('Apeldoorn', 'Gelderland', 'Noord', '7331', true),
('Apeldoorn', 'Gelderland', 'Oost', '7321', true),
('Apeldoorn', 'Gelderland', 'West', '7341', true),
('Apeldoorn', 'Gelderland', 'Zuid', '7314', true),

-- Medium cities
('Haarlem', 'Noord-Holland', 'Centrum', '2011', false),
('Haarlem', 'Noord-Holland', 'Noord', '2031', false),
('Haarlem', 'Noord-Holland', 'Oost', '2021', false),
('Haarlem', 'Noord-Holland', 'West', '2051', false),
('Haarlem', 'Noord-Holland', 'Zuid', '2015', false),

('Arnhem', 'Gelderland', 'Centrum', '6811', false),
('Arnhem', 'Gelderland', 'Noord', '6831', false),
('Arnhem', 'Gelderland', 'Oost', '6821', false),
('Arnhem', 'Gelderland', 'West', '6841', false),
('Arnhem', 'Gelderland', 'Zuid', '6814', false),

('Zaanstad', 'Noord-Holland', 'Zaandam', '1506', false),
('Zaanstad', 'Noord-Holland', 'Koog aan de Zaan', '1541', false),
('Zaanstad', 'Noord-Holland', 'Zaandijk', '1544', false),
('Zaanstad', 'Noord-Holland', 'Wormerveer', '1521', false),

('Amersfoort', 'Utrecht', 'Centrum', '3811', false),
('Amersfoort', 'Utrecht', 'Noord', '3831', false),
('Amersfoort', 'Utrecht', 'Oost', '3821', false),
('Amersfoort', 'Utrecht', 'West', '3841', false),
('Amersfoort', 'Utrecht', 'Zuid', '3814', false),

('Maastricht', 'Limburg', 'Centrum', '6211', false),
('Maastricht', 'Limburg', 'Noord', '6231', false),
('Maastricht', 'Limburg', 'Oost', '6221', false),
('Maastricht', 'Limburg', 'West', '6241', false),
('Maastricht', 'Limburg', 'Zuid', '6214', false),

('Dordrecht', 'Zuid-Holland', 'Centrum', '3311', false),
('Dordrecht', 'Zuid-Holland', 'Noord', '3331', false),
('Dordrecht', 'Zuid-Holland', 'Oost', '3321', false),
('Dordrecht', 'Zuid-Holland', 'West', '3341', false),

('Leiden', 'Zuid-Holland', 'Centrum', '2311', false),
('Leiden', 'Zuid-Holland', 'Noord', '2331', false),
('Leiden', 'Zuid-Holland', 'Oost', '2321', false),
('Leiden', 'Zuid-Holland', 'West', '2341', false),

('Haarlemmermeer', 'Noord-Holland', 'Hoofddorp', '2132', false),
('Haarlemmermeer', 'Noord-Holland', 'Nieuw-Vennep', '2151', false),
('Haarlemmermeer', 'Noord-Holland', 'Badhoevedorp', '1171', false),

('Zoetermeer', 'Zuid-Holland', 'Centrum', '2711', false),
('Zoetermeer', 'Zuid-Holland', 'Noord', '2731', false),
('Zoetermeer', 'Zuid-Holland', 'Oost', '2721', false),
('Zoetermeer', 'Zuid-Holland', 'West', '2741', false),

('Zwolle', 'Overijssel', 'Centrum', '8011', false),
('Zwolle', 'Overijssel', 'Noord', '8031', false),
('Zwolle', 'Overijssel', 'Oost', '8021', false),
('Zwolle', 'Overijssel', 'West', '8041', false);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dutch_cities_city_name ON dutch_cities_neighborhoods(city_name);
CREATE INDEX IF NOT EXISTS idx_dutch_cities_province ON dutch_cities_neighborhoods(province);
CREATE INDEX IF NOT EXISTS idx_dutch_cities_is_major ON dutch_cities_neighborhoods(is_major_city);

-- Add indexes for new tenant_profiles fields
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_sex ON tenant_profiles(sex);

-- RLS policies for profile pictures storage
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own profile pictures" ON storage.objects
FOR SELECT USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile pictures" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Public access for viewing profile pictures (for verhuurders to see tenant photos)
CREATE POLICY "Public can view profile pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-pictures');

-- RLS policies for dutch_cities_neighborhoods (public read access)
ALTER TABLE dutch_cities_neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read Dutch cities and neighborhoods" ON dutch_cities_neighborhoods
FOR SELECT USING (true);

-- Fix potential 409 conflicts by improving tenant_profiles upsert logic
-- Update the existing trigger to handle conflicts better
CREATE OR REPLACE FUNCTION handle_tenant_profile_conflicts()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle potential conflicts by updating existing records
  IF TG_OP = 'INSERT' THEN
    -- Check if a record already exists for this user
    IF EXISTS (SELECT 1 FROM tenant_profiles WHERE user_id = NEW.user_id) THEN
      -- Update the existing record instead of inserting
      UPDATE tenant_profiles 
      SET 
        first_name = NEW.first_name,
        last_name = NEW.last_name,
        phone = NEW.phone,
        date_of_birth = NEW.date_of_birth,
        profession = NEW.profession,
        monthly_income = NEW.monthly_income,
        bio = NEW.bio,
        preferred_city = NEW.preferred_city,
        min_budget = NEW.min_budget,
        max_budget = NEW.max_budget,
        preferred_bedrooms = NEW.preferred_bedrooms,
        preferred_property_type = NEW.preferred_property_type,
        motivation = NEW.motivation,
        profile_completed = NEW.profile_completed,
        nationality = NEW.nationality,
        marital_status = NEW.marital_status,
        has_children = NEW.has_children,
        number_of_children = NEW.number_of_children,
        has_partner = NEW.has_partner,
        partner_name = NEW.partner_name,
        partner_profession = NEW.partner_profession,
        partner_monthly_income = NEW.partner_monthly_income,
        partner_employment_status = NEW.partner_employment_status,
        preferred_districts = NEW.preferred_districts,
        max_commute_time = NEW.max_commute_time,
        transportation_preference = NEW.transportation_preference,
        furnished_preference = NEW.furnished_preference,
        desired_amenities = NEW.desired_amenities,
        sex = NEW.sex,
        smoking_details = NEW.smoking_details,
        updated_at = NOW()
      WHERE user_id = NEW.user_id;
      
      -- Return NULL to prevent the INSERT
      RETURN NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle conflicts
DROP TRIGGER IF EXISTS trigger_handle_tenant_profile_conflicts ON tenant_profiles;
CREATE TRIGGER trigger_handle_tenant_profile_conflicts
  BEFORE INSERT ON tenant_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_tenant_profile_conflicts();

-- Update existing records to have default values for new fields
UPDATE tenant_profiles 
SET 
  sex = NULL,
  smoking_details = NULL
WHERE sex IS NULL;

COMMENT ON COLUMN tenant_profiles.sex IS 'Gender selection: man, vrouw, anders, zeg_ik_liever_niet';
COMMENT ON COLUMN tenant_profiles.smoking_details IS 'Detailed smoking preferences (binnen huis, buiten, balkon, etc.)';
COMMENT ON TABLE dutch_cities_neighborhoods IS 'Comprehensive list of Dutch cities and their neighborhoods';
