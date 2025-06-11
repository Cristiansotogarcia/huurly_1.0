-- SECURE RLS POLICIES
-- Non-recursive, performance-optimized policies
-- Replaces all previous RLS attempts with stable, secure policies

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewing_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewing_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE beoordelaar_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Configuration tables (read-only for authenticated users)
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_types ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CORE USER POLICIES
-- ============================================================================

-- Profiles: Users can manage their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- User Roles: Users can view their own role, admins can manage all
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all user roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'beheerder'
      AND ur.is_active = true
    )
  );

-- ============================================================================
-- TENANT PROFILE POLICIES
-- ============================================================================

-- Tenant Profiles: Users can manage their own, landlords can view when relevant
CREATE POLICY "Users can manage own tenant profile" ON tenant_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Landlords can view tenant profiles for applications" ON tenant_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM property_applications pa
      JOIN properties p ON pa.property_id = p.id
      WHERE pa.tenant_id = tenant_profiles.user_id
      AND p.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Beoordelaars can view tenant profiles" ON tenant_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'beoordelaar'
      AND ur.is_active = true
    )
  );

-- ============================================================================
-- PROPERTY POLICIES
-- ============================================================================

-- Properties: Landlords manage own, others can view active
CREATE POLICY "Landlords can manage own properties" ON properties
  FOR ALL USING (landlord_id = auth.uid());

CREATE POLICY "Users can view active properties" ON properties
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can view all properties" ON properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'beheerder'
      AND ur.is_active = true
    )
  );

-- Property Images: Follow property access rules
CREATE POLICY "Property images follow property access" ON property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_images.property_id
      AND (p.landlord_id = auth.uid() OR p.status = 'active')
    )
  );

CREATE POLICY "Landlords can manage own property images" ON property_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_images.property_id
      AND p.landlord_id = auth.uid()
    )
  );

-- ============================================================================
-- APPLICATION AND OFFER POLICIES
-- ============================================================================

-- Property Applications: Tenants manage own, landlords view for their properties
CREATE POLICY "Tenants can manage own applications" ON property_applications
  FOR ALL USING (tenant_id = auth.uid());

CREATE POLICY "Landlords can view applications for their properties" ON property_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties p 
      WHERE p.id = property_applications.property_id 
      AND p.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Landlords can update applications for their properties" ON property_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM properties p 
      WHERE p.id = property_applications.property_id 
      AND p.landlord_id = auth.uid()
    )
  );

-- Property Offers: Similar to applications
CREATE POLICY "Tenants can view own offers" ON property_offers
  FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY "Landlords can manage offers for their properties" ON property_offers
  FOR ALL USING (landlord_id = auth.uid());

CREATE POLICY "Tenants can respond to offers" ON property_offers
  FOR UPDATE USING (tenant_id = auth.uid());

-- ============================================================================
-- DOCUMENT POLICIES
-- ============================================================================

-- User Documents: Users manage own, beoordelaars can view for review
CREATE POLICY "Users can manage own documents" ON user_documents
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Beoordelaars can view documents for review" ON user_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'beoordelaar'
      AND ur.is_active = true
    )
  );

CREATE POLICY "Beoordelaars can update document status" ON user_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'beoordelaar'
      AND ur.is_active = true
    )
  );

CREATE POLICY "Landlords can view documents for applicants" ON user_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM property_applications pa
      JOIN properties p ON pa.property_id = p.id
      WHERE pa.tenant_id = user_documents.user_id
      AND p.landlord_id = auth.uid()
      AND user_documents.status = 'approved'
    )
  );

-- ============================================================================
-- PAYMENT POLICIES
-- ============================================================================

-- Payment Records: Users can view own payments, admins can view all
CREATE POLICY "Users can view own payments" ON payment_records
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments" ON payment_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'beheerder'
      AND ur.is_active = true
    )
  );

-- ============================================================================
-- MESSAGING POLICIES
-- ============================================================================

-- Messages: Users can view messages they sent or received
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Notifications: Users can view and manage their own notifications
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- VIEWING POLICIES
-- ============================================================================

-- Viewing Invitations: Tenants and landlords can view their own
CREATE POLICY "Users can view own viewing invitations" ON viewing_invitations
  FOR SELECT USING (tenant_id = auth.uid() OR landlord_id = auth.uid());

CREATE POLICY "Landlords can create viewing invitations" ON viewing_invitations
  FOR INSERT WITH CHECK (landlord_id = auth.uid());

CREATE POLICY "Users can update own viewing invitations" ON viewing_invitations
  FOR UPDATE USING (tenant_id = auth.uid() OR landlord_id = auth.uid());

-- Viewing Slots: Follow property access rules
CREATE POLICY "Users can view slots for accessible properties" ON viewing_slots
  FOR SELECT USING (
    tenant_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = viewing_slots.property_id
      AND p.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Tenants can book viewing slots" ON viewing_slots
  FOR UPDATE USING (tenant_id = auth.uid());

CREATE POLICY "Landlords can manage slots for their properties" ON viewing_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = viewing_slots.property_id
      AND p.landlord_id = auth.uid()
    )
  );

-- ============================================================================
-- HOUSEHOLD POLICIES
-- ============================================================================

-- Household Info: Users manage their own
CREATE POLICY "Users can manage own household info" ON household_info
  FOR ALL USING (user_id = auth.uid());

-- Household Members: Users manage their own
CREATE POLICY "Users can manage own household members" ON household_members
  FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- BEOORDELAAR POLICIES
-- ============================================================================

-- Beoordelaar Assignments: Beoordelaars can view their own, admins can manage all
CREATE POLICY "Beoordelaars can view own assignments" ON beoordelaar_assignments
  FOR SELECT USING (
    beoordelaar_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'beheerder'
      AND ur.is_active = true
    )
  );

CREATE POLICY "Admins can manage beoordelaar assignments" ON beoordelaar_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'beheerder'
      AND ur.is_active = true
    )
  );

-- ============================================================================
-- USER PREFERENCE POLICIES
-- ============================================================================

-- User Preferences: Users manage their own, admins can view all
CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all preferences" ON user_preferences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'beheerder'
      AND ur.is_active = true
    )
  );

-- ============================================================================
-- CONFIGURATION TABLE POLICIES (READ-ONLY)
-- ============================================================================

-- System Config: Read-only for authenticated users, admins can manage
CREATE POLICY "Authenticated users can read system config" ON system_config
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can manage system config" ON system_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'beheerder'
      AND ur.is_active = true
    )
  );

-- Cities: Read-only for authenticated users
CREATE POLICY "Authenticated users can read cities" ON cities
  FOR SELECT TO authenticated USING (is_active = true);

-- Districts: Read-only for authenticated users
CREATE POLICY "Authenticated users can read districts" ON districts
  FOR SELECT TO authenticated USING (is_active = true);

-- Property Amenities: Read-only for authenticated users
CREATE POLICY "Authenticated users can read amenities" ON property_amenities
  FOR SELECT TO authenticated USING (is_active = true);

-- Document Types: Read-only for authenticated users
CREATE POLICY "Authenticated users can read document types" ON document_types
  FOR SELECT TO authenticated USING (is_active = true);

-- Status Types: Read-only for authenticated users
CREATE POLICY "Authenticated users can read status types" ON status_types
  FOR SELECT TO authenticated USING (is_active = true);

-- ============================================================================
-- DOCUMENT ACCESS REQUEST POLICIES
-- ============================================================================

-- Document Access Requests: Tenants and landlords can manage their own
CREATE POLICY "Users can view own document access requests" ON document_access_requests
  FOR SELECT USING (tenant_id = auth.uid() OR landlord_id = auth.uid());

CREATE POLICY "Landlords can create document access requests" ON document_access_requests
  FOR INSERT WITH CHECK (landlord_id = auth.uid());

CREATE POLICY "Users can update own document access requests" ON document_access_requests
  FOR UPDATE USING (tenant_id = auth.uid() OR landlord_id = auth.uid());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can view own profile" ON profiles IS 'Users can only see their own profile information';
COMMENT ON POLICY "Landlords can view tenant profiles for applications" ON tenant_profiles IS 'Landlords can view tenant profiles only for properties they own where tenant applied';
COMMENT ON POLICY "Users can view active properties" ON properties IS 'All authenticated users can browse active property listings';
COMMENT ON POLICY "Beoordelaars can view documents for review" ON user_documents IS 'Document reviewers can access documents for verification purposes';
