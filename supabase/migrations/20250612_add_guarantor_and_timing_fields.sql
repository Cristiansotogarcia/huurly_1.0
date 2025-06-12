-- ADD GUARANTOR AND TIMING FIELDS MIGRATION
-- Date: 2025-06-12
-- Purpose: Add high-priority guarantor and timing fields to tenant_profiles table

-- ============================================================================
-- PRIORITY 1: GUARANTOR INFORMATION (Critical for landlord confidence)
-- ============================================================================

DO $$ 
BEGIN
    -- Guarantor availability
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'guarantor_available'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN guarantor_available BOOLEAN DEFAULT false;
    END IF;

    -- Guarantor name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'guarantor_name'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN guarantor_name TEXT;
    END IF;

    -- Guarantor phone
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'guarantor_phone'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN guarantor_phone TEXT;
    END IF;

    -- Guarantor income
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'guarantor_income'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN guarantor_income DECIMAL(10,2) DEFAULT 0 CHECK (guarantor_income >= 0);
    END IF;

    -- Guarantor relationship
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'guarantor_relationship'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN guarantor_relationship TEXT 
        CHECK (guarantor_relationship IN ('ouder', 'familie', 'vriend', 'werkgever', 'anders'));
    END IF;

    -- Income proof availability
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'income_proof_available'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN income_proof_available BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ============================================================================
-- PRIORITY 2: TIMING INFORMATION (Essential for matching)
-- ============================================================================

DO $$ 
BEGIN
    -- Preferred move-in date
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'move_in_date_preferred'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN move_in_date_preferred DATE;
    END IF;

    -- Earliest move-in date
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'move_in_date_earliest'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN move_in_date_earliest DATE;
    END IF;

    -- Availability flexibility
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'availability_flexible'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN availability_flexible BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ============================================================================
-- INDEXES FOR ENHANCED SEARCH
-- ============================================================================

-- Index for guarantor filtering
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_guarantor 
ON tenant_profiles (guarantor_available, guarantor_income);

-- Index for timing matching
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_timing 
ON tenant_profiles (move_in_date_preferred, move_in_date_earliest, availability_flexible);

-- ============================================================================
-- UPDATE EXISTING RECORDS WITH SAFE DEFAULTS
-- ============================================================================

-- Update existing records with default values for new fields
UPDATE tenant_profiles 
SET 
    guarantor_available = false,
    income_proof_available = false,
    availability_flexible = false
WHERE 
    guarantor_available IS NULL 
    OR income_proof_available IS NULL 
    OR availability_flexible IS NULL;

-- Success message
SELECT 'Guarantor and timing fields migration completed successfully!' as result;
