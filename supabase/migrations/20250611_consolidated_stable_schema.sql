-- CONSOLIDATED SCHEMA MIGRATION
-- Replaces 24 fragmented migrations with single stable schema
-- Based on: 20250609_recreate_complete_schema.sql + all subsequent fixes

-- ============================================================================
-- ENUMS (Consolidated and Fixed)
-- ============================================================================

-- Fixed user_role enum (removed 'Manager', standardized casing)
CREATE TYPE user_role AS ENUM ('huurder', 'verhuurder', 'beoordelaar', 'beheerder');

-- Enhanced document types
CREATE TYPE document_type AS ENUM (
  'identity', 'payslip', 'employment_contract', 'reference', 
  'bank_statement', 'income_statement', 'bkr_check', 'guarantor_statement'
);

-- Enhanced document status
CREATE TYPE document_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'expired');

-- Property status enum
CREATE TYPE property_status AS ENUM ('draft', 'active', 'inactive', 'rented', 'archived');

-- Application status enum  
CREATE TYPE application_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'withdrawn');

-- ============================================================================
-- CORE TABLES (Stable Foundation)
-- ============================================================================

-- Users and Authentication
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT, -- Added for consistency
  phone TEXT, -- Added missing field
  date_of_birth DATE, -- Added missing field
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles (Enhanced)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_start_date TIMESTAMPTZ, -- Added from eliminate_hardcoded_data
  subscription_end_date TIMESTAMPTZ, -- Added missing field
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TENANT PROFILES (Enhanced and Fixed)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  first_name TEXT,
  last_name TEXT,
  age INTEGER,
  profession TEXT,
  employer TEXT,
  employment_status TEXT,
  work_contract_type TEXT,
  monthly_income DECIMAL(10,2),
  
  -- Housing Preferences  
  is_looking_for_place BOOLEAN DEFAULT true, -- FIX: Added missing field
  preferred_location TEXT,
  preferred_radius INTEGER,
  preferred_bedrooms INTEGER,
  max_rent DECIMAL(10,2),
  available_from DATE,
  move_in_flexibility TEXT,
  contract_type TEXT,
  
  -- Household Information
  household_composition TEXT,
  household_size INTEGER DEFAULT 1,
  has_pets BOOLEAN DEFAULT FALSE,
  pet_details TEXT,
  pet_policy_preference TEXT,
  smokes BOOLEAN DEFAULT FALSE,
  smoking_policy_preference TEXT,
  
  -- Profile Status
  documents_verified BOOLEAN DEFAULT FALSE,
  profile_completion_percentage INTEGER DEFAULT 0,
  profile_picture_url TEXT,
  profile_views INTEGER DEFAULT 0,
  landlord_interest INTEGER DEFAULT 0,
  
  -- Financial Information
  housing_allowance_eligible BOOLEAN DEFAULT FALSE,
  guarantor_available BOOLEAN DEFAULT FALSE,
  
  -- Additional Information
  bio TEXT,
  motivation TEXT,
  rental_history TEXT,
  current_housing_situation TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROPERTY MANAGEMENT (Enhanced)
-- ============================================================================

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT,
  postal_code TEXT,
  
  -- Property Details
  rent_amount DECIMAL(10,2) NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER,
  square_meters INTEGER,
  property_type TEXT,
  furnished BOOLEAN DEFAULT FALSE,
  
  -- Policies
  pets_allowed BOOLEAN DEFAULT FALSE,
  smoking_allowed BOOLEAN DEFAULT FALSE,
  
  -- Availability
  available_from DATE,
  available_until DATE,
  status property_status DEFAULT 'draft',
  
  -- Statistics
  application_count INTEGER DEFAULT 0,
  offers_sent INTEGER DEFAULT 0,
  max_offers INTEGER DEFAULT 10,
  view_count INTEGER DEFAULT 0, -- Added missing field
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Images
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  image_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONFIGURATION TABLES (From eliminate_hardcoded_data.sql)
-- ============================================================================

-- System Configuration
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(255) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cities and Districts
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) DEFAULT 'Netherlands',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Amenities
CREATE TABLE IF NOT EXISTS property_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_name VARCHAR(100),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Types (Enhanced)
CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_key VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  max_file_size_mb INTEGER DEFAULT 10,
  allowed_mime_types TEXT[] DEFAULT ARRAY['application/pdf', 'image/jpeg', 'image/png'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Status Types
CREATE TABLE IF NOT EXISTS status_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_key VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  color_class VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ENHANCED TABLES (Consolidated from multiple migrations)
-- ============================================================================

-- User Documents (Enhanced)
CREATE TABLE IF NOT EXISTS user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  status document_status DEFAULT 'pending',
  rejection_reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- Added missing field
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Records (Enhanced)
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  payment_method TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Applications (Enhanced)
CREATE TABLE IF NOT EXISTS property_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  application_message TEXT,
  status application_status DEFAULT 'pending',
  priority_score INTEGER DEFAULT 0, -- Added for ranking
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Offers
CREATE TABLE IF NOT EXISTS property_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  offered_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL,
  related_data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  related_id TEXT,
  related_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Viewing Invitations
CREATE TABLE IF NOT EXISTS viewing_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_address TEXT NOT NULL,
  proposed_date TEXT NOT NULL,
  message_id UUID REFERENCES messages(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Viewing Slots
CREATE TABLE IF NOT EXISTS viewing_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_number INTEGER NOT NULL,
  viewing_date DATE,
  status TEXT DEFAULT 'available',
  reserved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Access Requests
CREATE TABLE IF NOT EXISTS document_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id),
  status TEXT DEFAULT 'pending',
  access_granted_at TIMESTAMPTZ,
  access_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Household Info
CREATE TABLE IF NOT EXISTS household_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  has_pets BOOLEAN,
  pet_details TEXT,
  has_smokers BOOLEAN,
  smoking_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Household Members
CREATE TABLE IF NOT EXISTS household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL,
  relationship TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beoordelaar Assignments
CREATE TABLE IF NOT EXISTS beoordelaar_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beoordelaar_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  max_assignments INTEGER DEFAULT 10,
  current_assignments INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  preference_key VARCHAR(255) NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, preference_key)
);

-- ============================================================================
-- INDEXES (Comprehensive Performance Optimization)
-- ============================================================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);

-- Tenant profile indexes
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_user_id ON tenant_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_looking ON tenant_profiles(is_looking_for_place);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_location ON tenant_profiles(preferred_location);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_rent ON tenant_profiles(max_rent);

-- Property indexes
CREATE INDEX IF NOT EXISTS idx_properties_landlord_id ON properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_rent ON properties(rent_amount);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_available_from ON properties(available_from);

-- Application indexes
CREATE INDEX IF NOT EXISTS idx_applications_property_id ON property_applications(property_id);
CREATE INDEX IF NOT EXISTS idx_applications_tenant_id ON property_applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON property_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON property_applications(applied_at);

-- Document indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON user_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON user_documents(status);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payment_records(stripe_session_id);

-- Configuration indexes
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_districts_city_id ON districts(city_id);

-- Message and notification indexes
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Other indexes
CREATE INDEX IF NOT EXISTS idx_viewing_invitations_tenant_id ON viewing_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_viewing_invitations_landlord_id ON viewing_invitations(landlord_id);
CREATE INDEX IF NOT EXISTS idx_viewing_slots_property_id ON viewing_slots(property_id);
CREATE INDEX IF NOT EXISTS idx_household_info_user_id ON household_info(user_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_beoordelaar_assignments_active ON beoordelaar_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_beoordelaar_assignments_beoordelaar ON beoordelaar_assignments(beoordelaar_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);

-- ============================================================================
-- CONSTRAINTS (Data Integrity)
-- ============================================================================

-- Unique constraints
ALTER TABLE property_applications 
ADD CONSTRAINT unique_property_tenant_application 
UNIQUE (property_id, tenant_id);

ALTER TABLE property_offers 
ADD CONSTRAINT unique_property_tenant_offer 
UNIQUE (property_id, tenant_id);

-- Check constraints
ALTER TABLE tenant_profiles 
ADD CONSTRAINT check_age_valid 
CHECK (age IS NULL OR (age >= 18 AND age <= 120));

ALTER TABLE tenant_profiles 
ADD CONSTRAINT check_income_positive 
CHECK (monthly_income IS NULL OR monthly_income >= 0);

ALTER TABLE properties 
ADD CONSTRAINT check_rent_positive 
CHECK (rent_amount > 0);

ALTER TABLE properties 
ADD CONSTRAINT check_bedrooms_valid 
CHECK (bedrooms > 0 AND bedrooms <= 20);

-- ============================================================================
-- TRIGGERS (Automated Updates)
-- ============================================================================

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON profiles FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at 
BEFORE UPDATE ON user_roles FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_profiles_updated_at 
BEFORE UPDATE ON tenant_profiles FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at 
BEFORE UPDATE ON properties FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
BEFORE UPDATE ON property_applications FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at 
BEFORE UPDATE ON user_documents FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
BEFORE UPDATE ON payment_records FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at 
BEFORE UPDATE ON property_offers FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at 
BEFORE UPDATE ON notifications FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viewing_invitations_updated_at 
BEFORE UPDATE ON viewing_invitations FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viewing_slots_updated_at 
BEFORE UPDATE ON viewing_slots FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_access_requests_updated_at 
BEFORE UPDATE ON document_access_requests FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_household_info_updated_at 
BEFORE UPDATE ON household_info FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at 
BEFORE UPDATE ON system_config FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
BEFORE UPDATE ON user_preferences FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA (Essential Configuration)
-- ============================================================================

-- System configuration
INSERT INTO system_config (config_key, config_value, description) VALUES
('app_settings', '{"maintenance_mode": false, "registration_enabled": true}', 'Application-wide settings'),
('search_defaults', '{"max_price": 5000, "min_price": 0, "max_radius": 50}', 'Default search parameters'),
('notification_settings', '{"email_enabled": true, "push_enabled": false}', 'Notification preferences'),
('empty_state_messages', '{"no_users": "Nog geen gebruikers geregistreerd", "no_properties": "Nog geen woningen toegevoegd", "no_documents": "Nog geen documenten geüpload", "no_viewings": "Nog geen bezichtigingen gepland", "no_issues": "Geen openstaande issues", "no_notifications": "Geen nieuwe notificaties"}', 'Empty state messages for UI')
ON CONFLICT (config_key) DO NOTHING;

-- Dutch cities (major ones)
INSERT INTO cities (name) VALUES 
('Amsterdam'), ('Rotterdam'), ('Den Haag'), ('Utrecht'), ('Eindhoven'), 
('Groningen'), ('Tilburg'), ('Almere'), ('Breda'), ('Nijmegen'),
('Apeldoorn'), ('Haarlem'), ('Arnhem'), ('Zaanstad'), ('Amersfoort'),
('Maastricht'), ('Dordrecht'), ('Leiden'), ('Haarlemmermeer'), ('Zoetermeer'), ('Zwolle')
ON CONFLICT DO NOTHING;

-- Document types
INSERT INTO document_types (type_key, display_name, description, is_required) VALUES
('identity', 'Identiteitsbewijs', 'Geldig identiteitsbewijs', true),
('payslip', 'Loonstrook', 'Recente loonstrook', true),
('employment_contract', 'Arbeidscontract', 'Arbeidscontract', false),
('bank_statement', 'Bankafschrift', 'Bankafschrift laatste 3 maanden', false),
('reference', 'Referentie', 'Referentie van vorige verhuurder', false),
('income_statement', 'Inkomensverklaring', 'Jaaropgave of inkomensverklaring', false),
('bkr_check', 'BKR-uittreksel', 'BKR-registratie uittreksel', false),
('guarantor_statement', 'Borgstellingsverklaring', 'Borgstellingsverklaring van ouders/familie', false)
ON CONFLICT (type_key) DO NOTHING;

-- Status types
INSERT INTO status_types (status_key, display_name, color_class) VALUES
('pending', 'In behandeling', 'text-yellow-600 bg-yellow-100'),
('approved', 'Goedgekeurd', 'text-green-600 bg-green-100'),
('rejected', 'Afgewezen', 'text-red-600 bg-red-100'),
('under_review', 'Wordt beoordeeld', 'text-blue-600 bg-blue-100'),
('requires_action', 'Actie vereist', 'text-orange-600 bg-orange-100'),
('expired', 'Verlopen', 'text-gray-600 bg-gray-100')
ON CONFLICT (status_key) DO NOTHING;

-- Property amenities
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

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE profiles IS 'Core user profile information';
COMMENT ON TABLE user_roles IS 'User roles and subscription management';
COMMENT ON TABLE tenant_profiles IS 'Detailed tenant information and preferences';
COMMENT ON TABLE properties IS 'Property listings and management';
COMMENT ON TABLE property_applications IS 'Tenant applications for properties';
COMMENT ON TABLE user_documents IS 'Document verification system';
COMMENT ON TABLE payment_records IS 'Payment transaction history';
COMMENT ON TABLE system_config IS 'Application configuration settings';

COMMENT ON COLUMN tenant_profiles.is_looking_for_place IS 'FIXED: Added missing field referenced in dashboards';
COMMENT ON COLUMN properties.view_count IS 'Track property view statistics';
COMMENT ON COLUMN user_documents.expires_at IS 'Document expiration for periodic re-verification';
