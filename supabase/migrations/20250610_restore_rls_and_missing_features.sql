-- Restore RLS policies and missing features after database recreation
-- This migration adds back all the functionality that was lost during the reset

-- First, add missing columns to existing tables
ALTER TABLE payment_records 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'eur',
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'huurder_yearly';

-- Add missing subscription fields to user_roles
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Create subscribers table for Stripe subscription management
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create audit_logs table for recording changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_records_stripe_payment_intent ON payment_records(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_stripe_customer ON payment_records(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_stripe_customer ON subscribers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Add updated_at triggers for new tables
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON subscribers;
CREATE TRIGGER update_subscribers_updated_at 
    BEFORE UPDATE ON subscribers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Now add RLS policies carefully to avoid infinite recursion
-- We'll use a different approach that doesn't cause recursion

-- Enable RLS on core tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Service role can manage profiles" ON profiles
FOR ALL USING (auth.role() = 'service_role');

-- User roles RLS policies (simplified to avoid recursion)
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage roles" ON user_roles;

CREATE POLICY "Users can view own role" ON user_roles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own role" ON user_roles
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own role" ON user_roles
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage roles" ON user_roles
FOR ALL USING (auth.role() = 'service_role');

-- Payment records RLS policies
DROP POLICY IF EXISTS "Users can view own payments" ON payment_records;
DROP POLICY IF EXISTS "Users can insert own payments" ON payment_records;
DROP POLICY IF EXISTS "Service role can manage payments" ON payment_records;

CREATE POLICY "Users can view own payments" ON payment_records
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payments" ON payment_records
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage payments" ON payment_records
FOR ALL USING (auth.role() = 'service_role');

-- Subscribers RLS policies
DROP POLICY IF EXISTS "Users can view own subscription" ON subscribers;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscribers;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscribers;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscribers;

CREATE POLICY "Users can view own subscription" ON subscribers
FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can update own subscription" ON subscribers
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscription" ON subscribers
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage subscriptions" ON subscribers
FOR ALL USING (auth.role() = 'service_role');

-- Audit logs RLS policies (service role only)
DROP POLICY IF EXISTS "Service role can manage audit logs" ON audit_logs;

CREATE POLICY "Service role can manage audit logs" ON audit_logs
FOR ALL USING (auth.role() = 'service_role');

-- Add RLS policies for other tables that need user access
-- Tenant profiles
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenant_profiles') THEN
        ALTER TABLE tenant_profiles ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own tenant profile" ON tenant_profiles;
        DROP POLICY IF EXISTS "Users can insert own tenant profile" ON tenant_profiles;
        DROP POLICY IF EXISTS "Users can update own tenant profile" ON tenant_profiles;
        DROP POLICY IF EXISTS "Service role can manage tenant profiles" ON tenant_profiles;
        
        CREATE POLICY "Users can view own tenant profile" ON tenant_profiles 
        FOR SELECT USING (user_id = auth.uid());
        
        CREATE POLICY "Users can insert own tenant profile" ON tenant_profiles 
        FOR INSERT WITH CHECK (user_id = auth.uid());
        
        CREATE POLICY "Users can update own tenant profile" ON tenant_profiles 
        FOR UPDATE USING (user_id = auth.uid());
        
        CREATE POLICY "Service role can manage tenant profiles" ON tenant_profiles
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- User documents
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_documents') THEN
        ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own documents" ON user_documents;
        DROP POLICY IF EXISTS "Users can insert own documents" ON user_documents;
        DROP POLICY IF EXISTS "Users can update own documents" ON user_documents;
        DROP POLICY IF EXISTS "Service role can manage documents" ON user_documents;
        
        CREATE POLICY "Users can view own documents" ON user_documents 
        FOR SELECT USING (user_id = auth.uid());
        
        CREATE POLICY "Users can insert own documents" ON user_documents 
        FOR INSERT WITH CHECK (user_id = auth.uid());
        
        CREATE POLICY "Users can update own documents" ON user_documents 
        FOR UPDATE USING (user_id = auth.uid());
        
        CREATE POLICY "Service role can manage documents" ON user_documents
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Properties (landlords can manage their own properties)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'properties') THEN
        ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view all properties" ON properties;
        DROP POLICY IF EXISTS "Landlords can manage own properties" ON properties;
        DROP POLICY IF EXISTS "Service role can manage properties" ON properties;
        
        CREATE POLICY "Users can view all properties" ON properties 
        FOR SELECT USING (true);
        
        CREATE POLICY "Landlords can manage own properties" ON properties 
        FOR ALL USING (landlord_id = auth.uid());
        
        CREATE POLICY "Service role can manage properties" ON properties
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Property applications (tenants can view/create, landlords can view for their properties)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'property_applications') THEN
        ALTER TABLE property_applications ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Tenants can manage own applications" ON property_applications;
        DROP POLICY IF EXISTS "Landlords can view applications for their properties" ON property_applications;
        DROP POLICY IF EXISTS "Service role can manage applications" ON property_applications;
        
        CREATE POLICY "Tenants can manage own applications" ON property_applications 
        FOR ALL USING (tenant_id = auth.uid());
        
        CREATE POLICY "Landlords can view applications for their properties" ON property_applications 
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM properties 
                WHERE properties.id = property_applications.property_id 
                AND properties.landlord_id = auth.uid()
            )
        );
        
        CREATE POLICY "Service role can manage applications" ON property_applications
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Messages (users can view messages they sent or received)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own messages" ON messages;
        DROP POLICY IF EXISTS "Users can send messages" ON messages;
        DROP POLICY IF EXISTS "Service role can manage messages" ON messages;
        
        CREATE POLICY "Users can view own messages" ON messages 
        FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());
        
        CREATE POLICY "Users can send messages" ON messages 
        FOR INSERT WITH CHECK (sender_id = auth.uid());
        
        CREATE POLICY "Service role can manage messages" ON messages
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Notifications (users can view their own notifications)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
        DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
        DROP POLICY IF EXISTS "Service role can manage notifications" ON notifications;
        
        CREATE POLICY "Users can view own notifications" ON notifications 
        FOR SELECT USING (user_id = auth.uid());
        
        CREATE POLICY "Users can update own notifications" ON notifications 
        FOR UPDATE USING (user_id = auth.uid());
        
        CREATE POLICY "Service role can manage notifications" ON notifications
        FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Add comments explaining the policies
COMMENT ON POLICY "Users can view own profile" ON profiles IS 
'Allows users to view their own profile information';

COMMENT ON POLICY "Users can view own role" ON user_roles IS 
'Allows users to view their own role and subscription status';

COMMENT ON POLICY "Users can view own payments" ON payment_records IS 
'Allows users to view their own payment records';

COMMENT ON POLICY "Service role can manage audit logs" ON audit_logs IS 
'Allows service role to manage audit logs for system operations';

-- Create helper function to check if user has active subscription
CREATE OR REPLACE FUNCTION user_has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = user_uuid 
        AND subscription_status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION user_has_active_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_active_subscription(UUID) TO service_role;

COMMENT ON TABLE subscribers IS 'Stripe subscription management';
COMMENT ON TABLE audit_logs IS 'System audit trail for tracking changes';
COMMENT ON FUNCTION user_has_active_subscription(UUID) IS 'Helper function to check if user has active subscription';
