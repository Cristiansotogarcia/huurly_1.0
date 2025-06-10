-- MANUAL SQL SCRIPT FOR ENHANCED PROFILE MODAL FIXES
-- Run this in Supabase SQL Editor

-- Step 1: Add missing fields to tenant_profiles table
ALTER TABLE tenant_profiles 
ADD COLUMN IF NOT EXISTS sex TEXT CHECK (sex IN ('man', 'vrouw', 'anders', 'zeg_ik_liever_niet')),
ADD COLUMN IF NOT EXISTS smoking_details TEXT;

-- Step 2: Create comprehensive Dutch cities and neighborhoods table
CREATE TABLE IF NOT EXISTS dutch_cities_neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT NOT NULL,
  province TEXT NOT NULL,
  neighborhood_name TEXT NOT NULL,
  postal_code_prefix TEXT,
  population INTEGER,
  is_major_city BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_dutch_cities_city_name ON dutch_cities_neighborhoods(city_name);
CREATE INDEX IF NOT EXISTS idx_dutch_cities_province ON dutch_cities_neighborhoods(province);
CREATE INDEX IF NOT EXISTS idx_dutch_cities_is_major ON dutch_cities_neighborhoods(is_major_city);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_sex ON tenant_profiles(sex);

-- Step 4: Enable RLS on new table
ALTER TABLE dutch_cities_neighborhoods ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policy for Dutch cities
CREATE POLICY IF NOT EXISTS "Anyone can read Dutch cities and neighborhoods" 
ON dutch_cities_neighborhoods FOR SELECT USING (true);

-- Step 6: Insert comprehensive Dutch cities and neighborhoods data
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
('Zwolle', 'Overijssel', 'West', '8041', false)

ON CONFLICT (city_name, neighborhood_name) DO NOTHING;

-- Step 7: Add comments for documentation
COMMENT ON COLUMN tenant_profiles.sex IS 'Gender selection: man, vrouw, anders, zeg_ik_liever_niet';
COMMENT ON COLUMN tenant_profiles.smoking_details IS 'Detailed smoking preferences (binnen huis, buiten, balkon, etc.)';
COMMENT ON TABLE dutch_cities_neighborhoods IS 'Comprehensive list of Dutch cities and their neighborhoods';

-- Verification queries (run these to check if everything worked)
-- SELECT COUNT(*) FROM dutch_cities_neighborhoods;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'tenant_profiles' AND column_name IN ('sex', 'smoking_details');
