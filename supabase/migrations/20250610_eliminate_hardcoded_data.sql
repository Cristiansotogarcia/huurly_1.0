-- Migration: Eliminate ALL hardcoded data from Huurder Dashboard
-- This creates a fully configurable, database-driven system

-- 1. System Configuration Table
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(255) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Cities and Districts Tables
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) DEFAULT 'Netherlands',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Property Amenities Table
CREATE TABLE IF NOT EXISTS property_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_name VARCHAR(100),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Document Types Table
CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_key VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Status Types Table
CREATE TABLE IF NOT EXISTS status_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_key VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  color_class VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Beoordelaar Assignments Table
CREATE TABLE IF NOT EXISTS beoordelaar_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beoordelaar_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  max_assignments INTEGER DEFAULT 10,
  current_assignments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  preference_key VARCHAR(255) NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_key)
);

-- Add subscription_start_date to user_roles if not exists
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE;

-- Create function for beoordelaar assignment
CREATE OR REPLACE FUNCTION increment_beoordelaar_assignments(beoordelaar_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE beoordelaar_assignments 
  SET current_assignments = current_assignments + 1
  WHERE beoordelaar_assignments.beoordelaar_id = increment_beoordelaar_assignments.beoordelaar_id;
END;
$$ LANGUAGE plpgsql;

-- Create function for decrementing beoordelaar assignments
CREATE OR REPLACE FUNCTION decrement_beoordelaar_assignments(beoordelaar_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE beoordelaar_assignments 
  SET current_assignments = GREATEST(current_assignments - 1, 0)
  WHERE beoordelaar_assignments.beoordelaar_id = decrement_beoordelaar_assignments.beoordelaar_id;
END;
$$ LANGUAGE plpgsql;

-- Insert initial system configuration (EXCLUDING pricing to keep Stripe safe)
INSERT INTO system_config (config_key, config_value, description) VALUES
('default_search_limits', '{"max_price": 5000, "min_price": 0, "max_commute_time": 60}', 'Default search parameter limits'),
('notification_settings', '{"auto_assign_beoordelaar": true, "notification_delay_minutes": 5}', 'Notification system settings'),
('profile_defaults', '{"max_commute_time": 30, "transportation_preference": "public_transport", "furnished_preference": "no_preference"}', 'Default profile values'),
('empty_state_messages', '{"no_users": "Nog geen gebruikers geregistreerd", "no_properties": "Nog geen woningen toegevoegd", "no_documents": "Nog geen documenten geüpload", "no_viewings": "Nog geen bezichtigingen gepland", "no_issues": "Geen openstaande issues", "no_notifications": "Geen nieuwe notificaties"}', 'Empty state messages for UI')
ON CONFLICT (config_key) DO NOTHING;

-- Insert Dutch cities
INSERT INTO cities (name) VALUES 
('Amsterdam'), ('Rotterdam'), ('Den Haag'), ('Utrecht'), ('Eindhoven'), 
('Groningen'), ('Tilburg'), ('Almere'), ('Breda'), ('Nijmegen'),
('Apeldoorn'), ('Haarlem'), ('Arnhem'), ('Zaanstad'), ('Amersfoort'),
('Maastricht'), ('Dordrecht'), ('Leiden'), ('Haarlemmermeer'), ('Zoetermeer'), ('Zwolle')
ON CONFLICT DO NOTHING;

-- Insert districts for major cities
WITH city_districts AS (
  SELECT 
    c.id as city_id,
    unnest(CASE 
      WHEN c.name = 'Amsterdam' THEN ARRAY['Centrum', 'Jordaan', 'Oud-Zuid', 'Oud-West', 'Noord', 'Oost', 'West', 'Zuid', 'Zuidoost', 'De Pijp', 'Vondelpark', 'Museumkwartier']
      WHEN c.name = 'Rotterdam' THEN ARRAY['Centrum', 'Noord', 'Delfshaven', 'Overschie', 'Hillegersberg-Schiebroek', 'Kralingen-Crooswijk', 'Feijenoord', 'IJsselmonde', 'Pernis', 'Prins Alexander']
      WHEN c.name = 'Den Haag' THEN ARRAY['Centrum', 'Scheveningen', 'Bezuidenhout', 'Haagse Hout', 'Laak', 'Leidschenveen-Ypenburg', 'Loosduinen', 'Segbroek', 'Escamp']
      WHEN c.name = 'Utrecht' THEN ARRAY['Centrum', 'Noord', 'Oost', 'West', 'Zuid', 'Nieuwegein', 'Vleuten-De Meern', 'Zuilen', 'Overvecht', 'Kanaleneiland']
      WHEN c.name = 'Eindhoven' THEN ARRAY['Centrum', 'Noord', 'Oost', 'West', 'Zuid', 'Woensel', 'Stratum', 'Gestel', 'Strijp']
      WHEN c.name = 'Groningen' THEN ARRAY['Centrum', 'Noord', 'Oost', 'West', 'Zuid', 'Paddepoel', 'Vinkhuizen']
      WHEN c.name = 'Tilburg' THEN ARRAY['Centrum', 'Noord', 'Oost', 'West', 'Zuid']
      WHEN c.name = 'Almere' THEN ARRAY['Centrum', 'Haven', 'Stad', 'Buiten', 'Poort']
      WHEN c.name = 'Breda' THEN ARRAY['Centrum', 'Noord', 'Oost', 'West', 'Zuid']
      WHEN c.name = 'Nijmegen' THEN ARRAY['Centrum', 'Noord', 'Oost', 'West', 'Zuid']
      WHEN c.name = 'Apeldoorn' THEN ARRAY['Centrum', 'Noord', 'Oost', 'West', 'Zuid']
      WHEN c.name = 'Haarlem' THEN ARRAY['Centrum', 'Noord', 'Oost', 'West', 'Zuid']
      WHEN c.name = 'Arnhem' THEN ARRAY['Centrum', 'Noord', 'Oost', 'West', 'Zuid']
      WHEN c.name = 'Zaanstad' THEN ARRAY['Zaandam', 'Koog aan de Zaan', 'Zaandijk', 'Wormerveer']
      WHEN c.name = 'Amersfoort' THEN ARRAY['Centrum', 'Noord', 'Oost', 'West', 'Zuid']
      WHEN c.name = 'Maastricht' THEN ARRAY['Centrum', 'Noord', 'Oost', 'West', 'Zuid']
      WHEN c.name = 'Dordrecht' THEN ARRAY['Centrum', 'Noord', 'Oost', 'West']
      WHEN c.name = 'Leiden' THEN ARRAY['Centrum', 'Noord', 'Oost', 'West']
      WHEN c.name = 'Haarlemmermeer' THEN ARRAY['Hoofddorp', 'Nieuw-Vennep', 'Badhoevedorp']
      WHEN c.name = 'Zoetermeer' THEN ARRAY['Centrum', 'Noord', 'Oost', 'West']
      WHEN c.name = 'Zwolle' THEN ARRAY['Centrum', 'Noord', 'Oost', 'West']
      ELSE ARRAY['Centrum', 'Noord', 'Oost', 'West', 'Zuid']
    END) as district_name
  FROM cities c
)
INSERT INTO districts (city_id, name)
SELECT city_id, district_name FROM city_districts
ON CONFLICT DO NOTHING;

-- Insert property amenities
INSERT INTO property_amenities (name, icon_name, category) VALUES
('Balkon', 'TreePine', 'outdoor'),
('Tuin', 'TreePine', 'outdoor'),
('Parkeerplaats', 'ParkingCircle', 'parking'),
('Garage', 'ParkingCircle', 'parking'),
('Lift', 'ArrowRight', 'building'),
('Wasmachine aansluiting', 'WashingMachine', 'appliances'),
('Vaatwasser', 'Utensils', 'appliances'),
('Internet/WiFi', 'Wifi', 'utilities'),
('Bad', 'Bath', 'bathroom'),
('Douche', 'Bath', 'bathroom'),
('Airconditioning', 'Wind', 'climate'),
('Vloerverwarming', 'Thermometer', 'climate'),
('Open haard', 'Flame', 'climate'),
('Zwembad', 'Waves', 'luxury'),
('Sauna', 'Thermometer', 'luxury'),
('Fitnessruimte', 'Dumbbell', 'amenities'),
('Conciërge', 'User', 'service'),
('Beveiliging', 'Shield', 'security')
ON CONFLICT DO NOTHING;

-- Insert document types
INSERT INTO document_types (type_key, display_name, description, is_required) VALUES
('identity', 'Identiteitsbewijs', 'Geldig identiteitsbewijs (paspoort, ID-kaart, rijbewijs)', true),
('payslip', 'Loonstrook', 'Recente loonstrook (niet ouder dan 3 maanden)', true),
('employment_contract', 'Arbeidscontract', 'Arbeidscontract of werkgeversverklaring', true),
('reference', 'Referentie', 'Referentie van vorige verhuurder of werkgever', false),
('bank_statement', 'Bankafschrift', 'Bankafschrift van de laatste 3 maanden', false),
('income_statement', 'Inkomensverklaring', 'Jaaropgave of inkomensverklaring', false),
('bkr_check', 'BKR-uittreksel', 'BKR-registratie uittreksel', false),
('guarantor_statement', 'Borgstellingsverklaring', 'Borgstellingsverklaring van ouders/familie', false)
ON CONFLICT (type_key) DO NOTHING;

-- Insert status types
INSERT INTO status_types (status_key, display_name, color_class) VALUES
('pending', 'In behandeling', 'text-yellow-600 bg-yellow-100'),
('approved', 'Goedgekeurd', 'text-green-600 bg-green-100'),
('rejected', 'Afgewezen', 'text-red-600 bg-red-100'),
('under_review', 'Wordt beoordeeld', 'text-blue-600 bg-blue-100'),
('requires_action', 'Actie vereist', 'text-orange-600 bg-orange-100'),
('expired', 'Verlopen', 'text-gray-600 bg-gray-100')
ON CONFLICT (status_key) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);
CREATE INDEX IF NOT EXISTS idx_system_config_active ON system_config(is_active);
CREATE INDEX IF NOT EXISTS idx_cities_active ON cities(is_active);
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_districts_city ON districts(city_id);
CREATE INDEX IF NOT EXISTS idx_districts_active ON districts(is_active);
CREATE INDEX IF NOT EXISTS idx_amenities_active ON property_amenities(is_active);
CREATE INDEX IF NOT EXISTS idx_amenities_category ON property_amenities(category);
CREATE INDEX IF NOT EXISTS idx_document_types_active ON document_types(is_active);
CREATE INDEX IF NOT EXISTS idx_document_types_key ON document_types(type_key);
CREATE INDEX IF NOT EXISTS idx_status_types_active ON status_types(is_active);
CREATE INDEX IF NOT EXISTS idx_status_types_key ON status_types(status_key);
CREATE INDEX IF NOT EXISTS idx_beoordelaar_assignments_active ON beoordelaar_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_beoordelaar_assignments_beoordelaar ON beoordelaar_assignments(beoordelaar_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);

-- Enable RLS on new tables
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE beoordelaar_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for system_config (read-only for all authenticated users)
CREATE POLICY "Allow read access to system_config for authenticated users" ON system_config
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Allow admin to manage system_config" ON system_config
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'Beheerder'
    )
  );

-- Create RLS policies for cities (read-only for all authenticated users)
CREATE POLICY "Allow read access to cities for authenticated users" ON cities
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Allow admin to manage cities" ON cities
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'Beheerder'
    )
  );

-- Create RLS policies for districts (read-only for all authenticated users)
CREATE POLICY "Allow read access to districts for authenticated users" ON districts
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Allow admin to manage districts" ON districts
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'Beheerder'
    )
  );

-- Create RLS policies for property_amenities (read-only for all authenticated users)
CREATE POLICY "Allow read access to amenities for authenticated users" ON property_amenities
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Allow admin to manage amenities" ON property_amenities
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'Beheerder'
    )
  );

-- Create RLS policies for document_types (read-only for all authenticated users)
CREATE POLICY "Allow read access to document_types for authenticated users" ON document_types
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Allow admin to manage document_types" ON document_types
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'Beheerder'
    )
  );

-- Create RLS policies for status_types (read-only for all authenticated users)
CREATE POLICY "Allow read access to status_types for authenticated users" ON status_types
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Allow admin to manage status_types" ON status_types
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'Beheerder'
    )
  );

-- Create RLS policies for beoordelaar_assignments
CREATE POLICY "Allow beoordelaars to view their assignments" ON beoordelaar_assignments
  FOR SELECT TO authenticated USING (
    beoordelaar_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('Beheerder', 'Beoordelaar')
    )
  );

CREATE POLICY "Allow admin to manage beoordelaar_assignments" ON beoordelaar_assignments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'Beheerder'
    )
  );

-- Create RLS policies for user_preferences
CREATE POLICY "Allow users to manage their own preferences" ON user_preferences
  FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Allow admin to view all preferences" ON user_preferences
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'Beheerder'
    )
  );

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some test beoordelaars (if they exist)
INSERT INTO beoordelaar_assignments (beoordelaar_id, max_assignments)
SELECT p.id, 15
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
WHERE ur.role = 'Beoordelaar'
AND NOT EXISTS (
  SELECT 1 FROM beoordelaar_assignments ba 
  WHERE ba.beoordelaar_id = p.id
)
LIMIT 5;

-- Add helpful comments
COMMENT ON TABLE system_config IS 'Centralized system configuration to eliminate hardcoded values';
COMMENT ON TABLE cities IS 'Available cities for property listings and user preferences';
COMMENT ON TABLE districts IS 'Districts/neighborhoods within cities';
COMMENT ON TABLE property_amenities IS 'Available property amenities with icons and categories';
COMMENT ON TABLE document_types IS 'Document types required for tenant verification';
COMMENT ON TABLE status_types IS 'Status types for documents, applications, etc. with display styling';
COMMENT ON TABLE beoordelaar_assignments IS 'Manages workload distribution among beoordelaars';
COMMENT ON TABLE user_preferences IS 'User-specific preferences and settings';

COMMENT ON COLUMN system_config.config_value IS 'JSON configuration value - allows complex nested settings';
COMMENT ON COLUMN property_amenities.icon_name IS 'Lucide icon name for UI display';
COMMENT ON COLUMN status_types.color_class IS 'Tailwind CSS classes for status styling';
COMMENT ON COLUMN beoordelaar_assignments.current_assignments IS 'Current number of active assignments';
COMMENT ON COLUMN beoordelaar_assignments.max_assignments IS 'Maximum assignments this beoordelaar can handle';
