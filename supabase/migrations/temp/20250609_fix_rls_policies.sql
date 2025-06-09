-- Migration to fix RLS policies for all tables
-- This ensures the frontend can access the database tables properly

-- Fix user_roles table RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Users can update own role" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;

-- Create new policies for user_roles
CREATE POLICY "Users can view own role" ON user_roles 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own role" ON user_roles 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role" ON user_roles 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix profiles table RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new policies for profiles
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Fix payment_records table RLS
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON payment_records;
CREATE POLICY "Users can view own payments" ON payment_records 
FOR SELECT USING (auth.uid() = user_id);

-- Fix user_documents table RLS (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_documents') THEN
        ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own documents" ON user_documents;
        DROP POLICY IF EXISTS "Users can insert own documents" ON user_documents;
        
        CREATE POLICY "Users can view own documents" ON user_documents 
        FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own documents" ON user_documents 
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Fix tenant_profiles table RLS (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenant_profiles') THEN
        ALTER TABLE tenant_profiles ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own tenant profile" ON tenant_profiles;
        DROP POLICY IF EXISTS "Users can insert own tenant profile" ON tenant_profiles;
        DROP POLICY IF EXISTS "Users can update own tenant profile" ON tenant_profiles;
        
        CREATE POLICY "Users can view own tenant profile" ON tenant_profiles 
        FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own tenant profile" ON tenant_profiles 
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update own tenant profile" ON tenant_profiles 
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add comments explaining the policies
COMMENT ON POLICY "Users can view own role" ON user_roles IS 
'Allows users to view their own role and subscription status';

COMMENT ON POLICY "Users can view own profile" ON profiles IS 
'Allows users to view their own profile information';

COMMENT ON POLICY "Users can view own payments" ON payment_records IS 
'Allows users to view their own payment records';
