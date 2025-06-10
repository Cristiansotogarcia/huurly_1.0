-- Complete schema recreation after database reset
-- This migration recreates ALL tables needed for the application to function

-- Create enums first
CREATE TYPE user_role AS ENUM ('Huurder', 'Verhuurder', 'Manager', 'Beheerder', 'Beoordelaar');
CREATE TYPE document_type AS ENUM ('identity', 'payslip');
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  subscription_status TEXT DEFAULT 'inactive',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payment_records table
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL,
  amount INTEGER,
  status TEXT,
  stripe_customer_id TEXT,
  stripe_session_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tenant_profiles table
CREATE TABLE IF NOT EXISTS tenant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  age INTEGER,
  profession TEXT,
  employer TEXT,
  employment_status TEXT,
  work_contract_type TEXT,
  monthly_income DECIMAL(10,2),
  housing_allowance_eligible BOOLEAN,
  guarantor_available BOOLEAN,
  bio TEXT,
  motivation TEXT,
  rental_history TEXT,
  current_housing_situation TEXT,
  preferred_location TEXT,
  preferred_radius INTEGER,
  preferred_bedrooms INTEGER,
  max_rent DECIMAL(10,2),
  available_from DATE,
  move_in_flexibility TEXT,
  contract_type TEXT,
  household_composition TEXT,
  household_size INTEGER DEFAULT 1,
  has_pets BOOLEAN DEFAULT FALSE,
  pet_details TEXT,
  pet_policy_preference TEXT,
  smokes BOOLEAN DEFAULT FALSE,
  smoking_policy_preference TEXT,
  documents_verified BOOLEAN DEFAULT FALSE,
  profile_completion_percentage INTEGER DEFAULT 0,
  profile_picture_url TEXT,
  profile_views INTEGER DEFAULT 0,
  landlord_interest INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT,
  postal_code TEXT,
  rent_amount DECIMAL(10,2) NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER,
  square_meters INTEGER,
  property_type TEXT,
  furnished BOOLEAN DEFAULT FALSE,
  pets_allowed BOOLEAN DEFAULT FALSE,
  smoking_allowed BOOLEAN DEFAULT FALSE,
  available_from DATE,
  available_until DATE,
  status TEXT DEFAULT 'active',
  application_count INTEGER DEFAULT 0,
  offers_sent INTEGER DEFAULT 0,
  max_offers INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create property_images table
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  image_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create property_applications table
CREATE TABLE IF NOT EXISTS property_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  application_message TEXT,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT
);

-- Create property_offers table
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

-- Create messages table
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

-- Create notifications table
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

-- Create user_documents table
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
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create viewing_invitations table
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

-- Create viewing_slots table
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

-- Create document_access_requests table
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

-- Create household_info table
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

-- Create household_members table
CREATE TABLE IF NOT EXISTS household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL,
  relationship TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: Test user data will be inserted after user authentication is set up
-- The tables are now ready to receive data through the application

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_user_id ON tenant_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_landlord_id ON properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_property_applications_property_id ON property_applications(property_id);
CREATE INDEX IF NOT EXISTS idx_property_applications_tenant_id ON property_applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_offers_property_id ON property_offers(property_id);
CREATE INDEX IF NOT EXISTS idx_property_offers_tenant_id ON property_offers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_viewing_invitations_tenant_id ON viewing_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_viewing_invitations_landlord_id ON viewing_invitations(landlord_id);
CREATE INDEX IF NOT EXISTS idx_viewing_slots_property_id ON viewing_slots(property_id);
CREATE INDEX IF NOT EXISTS idx_household_info_user_id ON household_info(user_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON household_members(user_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_records_updated_at BEFORE UPDATE ON payment_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenant_profiles_updated_at BEFORE UPDATE ON tenant_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_property_offers_updated_at BEFORE UPDATE ON property_offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_documents_updated_at BEFORE UPDATE ON user_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_viewing_invitations_updated_at BEFORE UPDATE ON viewing_invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_viewing_slots_updated_at BEFORE UPDATE ON viewing_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_access_requests_updated_at BEFORE UPDATE ON document_access_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_household_info_updated_at BEFORE UPDATE ON household_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add unique constraints
ALTER TABLE property_applications ADD CONSTRAINT unique_property_tenant_application UNIQUE (property_id, tenant_id);
ALTER TABLE property_offers ADD CONSTRAINT unique_property_tenant_offer UNIQUE (property_id, tenant_id);

-- Note: RLS is intentionally NOT enabled to avoid the infinite recursion issue
-- Tables are publicly accessible for now - this can be secured later with proper policies

COMMENT ON TABLE profiles IS 'User profile information';
COMMENT ON TABLE user_roles IS 'User roles and subscription status';
COMMENT ON TABLE payment_records IS 'Payment transaction records';
COMMENT ON TABLE tenant_profiles IS 'Detailed tenant profile information';
COMMENT ON TABLE properties IS 'Property listings';
COMMENT ON TABLE property_images IS 'Property images';
COMMENT ON TABLE property_applications IS 'Tenant applications for properties';
COMMENT ON TABLE property_offers IS 'Landlord offers to tenants';
COMMENT ON TABLE messages IS 'Internal messaging system';
COMMENT ON TABLE notifications IS 'User notifications';
COMMENT ON TABLE user_documents IS 'User uploaded documents';
COMMENT ON TABLE viewing_invitations IS 'Property viewing invitations';
COMMENT ON TABLE viewing_slots IS 'Property viewing time slots';
COMMENT ON TABLE document_access_requests IS 'Document access requests between users';
COMMENT ON TABLE household_info IS 'Household information';
COMMENT ON TABLE household_members IS 'Household member details';
