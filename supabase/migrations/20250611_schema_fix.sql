-- SCHEMA FIX MIGRATION
-- Addresses critical issues found in database audit
-- Date: 2025-06-11
-- Purpose: Fix missing tables, constraints, and performance issues

-- ============================================================================
-- CRITICAL FIXES FROM AUDIT
-- ============================================================================

-- This migration should be applied after the consolidated schema migration
-- It addresses specific issues found during the audit process

-- ============================================================================
-- PERFORMANCE INDEXES (From Audit Recommendations)
-- ============================================================================

-- Critical tenant matching composite index
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_matching 
ON tenant_profiles (is_looking_for_place, preferred_location, max_rent)
WHERE is_looking_for_place = true;

-- Critical property search composite index  
CREATE INDEX IF NOT EXISTS idx_properties_search 
ON properties (status, city, rent_amount, bedrooms, available_from)
WHERE status = 'active';

-- Document verification index
CREATE INDEX IF NOT EXISTS idx_user_documents_verification 
ON user_documents (user_id, status, document_type);

-- Payment processing index
CREATE INDEX IF NOT EXISTS idx_payment_records_user_status 
ON payment_records (user_id, status, created_at);

-- Notification delivery index
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications (user_id, read, created_at)
WHERE read = false;

-- Application management index
CREATE INDEX IF NOT EXISTS idx_property_applications_landlord 
ON property_applications (property_id, status, applied_at);

-- Message threading index
CREATE INDEX IF NOT EXISTS idx_messages_conversation 
ON messages (sender_id, recipient_id, created_at);

-- ============================================================================
-- BUSINESS LOGIC CONSTRAINTS
-- ============================================================================

-- Prevent duplicate tenant profiles (if not already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_tenant_profile_per_user'
    ) THEN
        ALTER TABLE tenant_profiles 
        ADD CONSTRAINT unique_tenant_profile_per_user 
        UNIQUE (user_id);
    END IF;
END $$;

-- Prevent duplicate user roles (if not already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_user_role_per_user'
    ) THEN
        ALTER TABLE user_roles 
        ADD CONSTRAINT unique_user_role_per_user 
        UNIQUE (user_id);
    END IF;
END $$;

-- Prevent multiple approved documents of same type
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_approved_document_per_type 
ON user_documents (user_id, document_type) 
WHERE status = 'approved';

-- Prevent duplicate property applications
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_property_tenant_application'
    ) THEN
        ALTER TABLE property_applications 
        ADD CONSTRAINT unique_property_tenant_application 
        UNIQUE (property_id, tenant_id);
    END IF;
END $$;

-- ============================================================================
-- DATA INTEGRITY CONSTRAINTS
-- ============================================================================

-- Age validation for tenant profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_tenant_age_valid'
    ) THEN
        ALTER TABLE tenant_profiles 
        ADD CONSTRAINT check_tenant_age_valid 
        CHECK (age IS NULL OR (age >= 18 AND age <= 120));
    END IF;
END $$;

-- Income validation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_tenant_income_positive'
    ) THEN
        ALTER TABLE tenant_profiles 
        ADD CONSTRAINT check_tenant_income_positive 
        CHECK (monthly_income IS NULL OR monthly_income >= 0);
    END IF;
END $$;

-- Rent amount validation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_property_rent_positive'
    ) THEN
        ALTER TABLE properties 
        ADD CONSTRAINT check_property_rent_positive 
        CHECK (rent_amount > 0);
    END IF;
END $$;

-- Bedroom count validation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_property_bedrooms_valid'
    ) THEN
        ALTER TABLE properties 
        ADD CONSTRAINT check_property_bedrooms_valid 
        CHECK (bedrooms > 0 AND bedrooms <= 20);
    END IF;
END $$;

-- Payment amount validation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_payment_amount_positive'
    ) THEN
        ALTER TABLE payment_records 
        ADD CONSTRAINT check_payment_amount_positive 
        CHECK (amount > 0);
    END IF;
END $$;

-- ============================================================================
-- MISSING FIELDS AND ENHANCEMENTS
-- ============================================================================

-- Add missing profile completion tracking
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' 
        AND column_name = 'profile_completion_percentage'
    ) THEN
        ALTER TABLE tenant_profiles 
        ADD COLUMN profile_completion_percentage INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add missing document expiration tracking
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_documents' 
        AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE user_documents 
        ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;
END $$;

-- Add missing property view tracking
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'view_count'
    ) THEN
        ALTER TABLE properties 
        ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add missing subscription tracking
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_roles' 
        AND column_name = 'subscription_end_date'
    ) THEN
        ALTER TABLE user_roles 
        ADD COLUMN subscription_end_date TIMESTAMPTZ;
    END IF;
END $$;

-- ============================================================================
-- AUDIT LOG TABLE (If Missing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action 
ON audit_logs (user_id, action, created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record 
ON audit_logs (table_name, record_id, created_at);

-- ============================================================================
-- SUBSCRIBERS TABLE (If Missing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    subscription_source TEXT DEFAULT 'website',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for subscriber management
CREATE INDEX IF NOT EXISTS idx_subscribers_email_active 
ON subscribers (email, is_active);

-- ============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ============================================================================

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_score INTEGER := 0;
    total_fields INTEGER := 20; -- Adjust based on required fields
BEGIN
    SELECT 
        CASE WHEN first_name IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN last_name IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN age IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN profession IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN monthly_income IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN preferred_location IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN max_rent IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN available_from IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN household_size IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN bio IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN profile_picture_url IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN employment_status IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN preferred_bedrooms IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN contract_type IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN household_composition IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN current_housing_situation IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN motivation IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN rental_history IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN employer IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN work_contract_type IS NOT NULL THEN 1 ELSE 0 END
    INTO completion_score
    FROM tenant_profiles 
    WHERE id = profile_id;
    
    RETURN ROUND((completion_score::FLOAT / total_fields) * 100);
END;
$$ LANGUAGE plpgsql;

-- Function to update profile completion automatically
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completion_percentage := calculate_profile_completion(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update profile completion
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON tenant_profiles;
CREATE TRIGGER trigger_update_profile_completion
    BEFORE INSERT OR UPDATE ON tenant_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completion();

-- ============================================================================
-- SECURITY ENHANCEMENTS
-- ============================================================================

-- Ensure RLS is enabled on all critical tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON INDEX idx_tenant_profiles_matching IS 'Critical index for tenant-property matching queries';
COMMENT ON INDEX idx_properties_search IS 'Critical index for property search and filtering';
COMMENT ON INDEX idx_user_documents_verification IS 'Index for document verification workflow';
COMMENT ON FUNCTION calculate_profile_completion IS 'Calculates profile completion percentage based on filled fields';
COMMENT ON TRIGGER trigger_update_profile_completion ON tenant_profiles IS 'Auto-updates profile completion percentage on changes';

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

-- Log successful migration
INSERT INTO audit_logs (action, table_name, record_id, new_values)
VALUES (
    'SCHEMA_FIX_MIGRATION', 
    'system', 
    '20250611_schema_fix', 
    jsonb_build_object(
        'migration_date', NOW(),
        'fixes_applied', jsonb_build_array(
            'performance_indexes',
            'business_logic_constraints', 
            'data_integrity_constraints',
            'missing_fields',
            'audit_logging',
            'security_enhancements'
        )
    )
);

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Schema fix migration completed successfully at %', NOW();
    RAISE NOTICE 'Applied performance indexes, constraints, and security enhancements';
END $$;
