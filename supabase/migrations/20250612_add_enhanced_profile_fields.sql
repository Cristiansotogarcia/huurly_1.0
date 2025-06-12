-- ADD ENHANCED PROFILE FIELDS MIGRATION
-- Date: 2025-06-12
-- Purpose: Add all missing enhanced fields from 7-step profile modal to tenant_profiles table

-- ============================================================================
-- ENHANCED PROFILE FIELDS FOR 7-STEP MODAL
-- ============================================================================

-- Step 1: Personal Information (Enhanced)
DO $$ 
BEGIN
    -- Nationality field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'nationality'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN nationality TEXT DEFAULT 'Nederlandse';
    END IF;

    -- Sex/Gender field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'sex'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN sex TEXT CHECK (sex IN ('man', 'vrouw', 'anders', 'zeg_ik_liever_niet'));
    END IF;

    -- Profile picture URL
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'profile_picture_url'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN profile_picture_url TEXT;
    END IF;
END $$;

-- Step 2: Family & Relationship Status
DO $$ 
BEGIN
    -- Marital status
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'marital_status'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN marital_status TEXT DEFAULT 'single' 
        CHECK (marital_status IN ('single', 'married', 'partnership', 'divorced', 'widowed'));
    END IF;

    -- Has children
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'has_children'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN has_children BOOLEAN DEFAULT false;
    END IF;

    -- Number of children
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'number_of_children'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN number_of_children INTEGER DEFAULT 0 CHECK (number_of_children >= 0);
    END IF;

    -- Children ages (JSON array)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'children_ages'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN children_ages JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Step 4: Partner Information
DO $$ 
BEGIN
    -- Has partner
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'has_partner'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN has_partner BOOLEAN DEFAULT false;
    END IF;

    -- Partner name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'partner_name'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN partner_name TEXT;
    END IF;

    -- Partner profession
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'partner_profession'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN partner_profession TEXT;
    END IF;

    -- Partner monthly income
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'partner_monthly_income'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN partner_monthly_income DECIMAL(10,2) DEFAULT 0 CHECK (partner_monthly_income >= 0);
    END IF;

    -- Partner employment status
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'partner_employment_status'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN partner_employment_status TEXT 
        CHECK (partner_employment_status IN ('employed', 'self_employed', 'freelance', 'student', 'unemployed'));
    END IF;
END $$;

-- Step 5: Location Preferences
DO $$ 
BEGIN
    -- Preferred districts (JSON array)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'preferred_districts'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN preferred_districts JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Max commute time
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'max_commute_time'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN max_commute_time INTEGER DEFAULT 30 CHECK (max_commute_time > 0);
    END IF;

    -- Transportation preference
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'transportation_preference'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN transportation_preference TEXT DEFAULT 'public_transport'
        CHECK (transportation_preference IN ('public_transport', 'bicycle', 'car', 'walking', 'mixed'));
    END IF;
END $$;

-- Step 6: Housing & Lifestyle Preferences
DO $$ 
BEGIN
    -- Furnished preference
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'furnished_preference'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN furnished_preference TEXT DEFAULT 'no_preference'
        CHECK (furnished_preference IN ('furnished', 'unfurnished', 'no_preference'));
    END IF;

    -- Desired amenities (JSON array)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'desired_amenities'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN desired_amenities JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Smoking details
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'smoking_details'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN smoking_details TEXT;
    END IF;
END $$;

-- ============================================================================
-- COMPUTED COLUMNS AND TRIGGERS
-- ============================================================================

-- Add total household income computed column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'total_household_income'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN total_household_income DECIMAL(10,2) GENERATED ALWAYS AS (
            monthly_income + COALESCE(partner_monthly_income, 0)
        ) STORED;
    END IF;
END $$;

-- Add family composition computed column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenant_profiles' AND column_name = 'family_composition'
    ) THEN
        ALTER TABLE tenant_profiles ADD COLUMN family_composition TEXT GENERATED ALWAYS AS (
            CASE 
                WHEN has_partner AND has_children THEN 'family_with_children'
                WHEN has_partner AND NOT has_children THEN 'couple'
                WHEN NOT has_partner AND has_children THEN 'single_parent'
                ELSE 'single'
            END
        ) STORED;
    END IF;
END $$;

-- ============================================================================
-- INDEXES FOR ENHANCED SEARCH
-- ============================================================================

-- Index for enhanced tenant matching
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_enhanced_search 
ON tenant_profiles (nationality, marital_status, has_children, has_partner, preferred_city);

-- Index for family composition filtering
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_family_composition 
ON tenant_profiles (family_composition, total_household_income);

-- Index for location and amenities search
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_location_amenities 
ON tenant_profiles USING GIN (preferred_districts, desired_amenities);

-- Index for lifestyle preferences
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_lifestyle 
ON tenant_profiles (furnished_preference, has_pets, smokes);

-- ============================================================================
-- UPDATE EXISTING RECORDS
-- ============================================================================

-- Update existing records with default values where appropriate
UPDATE tenant_profiles 
SET 
    nationality = COALESCE(nationality, 'Nederlandse'),
    marital_status = COALESCE(marital_status, 'single'),
    has_children = COALESCE(has_children, false),
    number_of_children = COALESCE(number_of_children, 0),
    children_ages = COALESCE(children_ages, '[]'::jsonb),
    has_partner = COALESCE(has_partner, false),
    partner_monthly_income = COALESCE(partner_monthly_income, 0),
    preferred_districts = COALESCE(preferred_districts, '[]'::jsonb),
    max_commute_time = COALESCE(max_commute_time, 30),
    transportation_preference = COALESCE(transportation_preference, 'public_transport'),
    furnished_preference = COALESCE(furnished_preference, 'no_preference'),
    desired_amenities = COALESCE(desired_amenities, '[]'::jsonb)
WHERE 
    nationality IS NULL 
    OR marital_status IS NULL 
    OR has_children IS NULL 
    OR number_of_children IS NULL 
    OR children_ages IS NULL 
    OR has_partner IS NULL 
    OR partner_monthly_income IS NULL 
    OR preferred_districts IS NULL 
    OR max_commute_time IS NULL 
    OR transportation_preference IS NULL 
    OR furnished_preference IS NULL 
    OR desired_amenities IS NULL;

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN tenant_profiles.nationality IS 'Tenant nationality for filtering and matching';
COMMENT ON COLUMN tenant_profiles.sex IS 'Gender identity (optional)';
COMMENT ON COLUMN tenant_profiles.marital_status IS 'Marital status for family composition';
COMMENT ON COLUMN tenant_profiles.has_children IS 'Whether tenant has children';
COMMENT ON COLUMN tenant_profiles.number_of_children IS 'Number of children';
COMMENT ON COLUMN tenant_profiles.children_ages IS 'Ages of children as JSON array';
COMMENT ON COLUMN tenant_profiles.has_partner IS 'Whether tenant has a partner';
COMMENT ON COLUMN tenant_profiles.partner_name IS 'Partner name';
COMMENT ON COLUMN tenant_profiles.partner_profession IS 'Partner profession';
COMMENT ON COLUMN tenant_profiles.partner_monthly_income IS 'Partner monthly income';
COMMENT ON COLUMN tenant_profiles.partner_employment_status IS 'Partner employment status';
COMMENT ON COLUMN tenant_profiles.preferred_districts IS 'Preferred districts as JSON array';
COMMENT ON COLUMN tenant_profiles.max_commute_time IS 'Maximum acceptable commute time in minutes';
COMMENT ON COLUMN tenant_profiles.transportation_preference IS 'Preferred transportation method';
COMMENT ON COLUMN tenant_profiles.furnished_preference IS 'Preference for furnished/unfurnished';
COMMENT ON COLUMN tenant_profiles.desired_amenities IS 'Desired amenities as JSON array';
COMMENT ON COLUMN tenant_profiles.smoking_details IS 'Smoking habits and details';
COMMENT ON COLUMN tenant_profiles.total_household_income IS 'Computed total household income';
COMMENT ON COLUMN tenant_profiles.family_composition IS 'Computed family composition type';

-- ============================================================================
-- VALIDATION AND SUCCESS
-- ============================================================================

-- Verify all columns were added successfully
DO $$ 
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    expected_columns TEXT[] := ARRAY[
        'nationality', 'sex', 'profile_picture_url',
        'marital_status', 'has_children', 'number_of_children', 'children_ages',
        'has_partner', 'partner_name', 'partner_profession', 'partner_monthly_income', 'partner_employment_status',
        'preferred_districts', 'max_commute_time', 'transportation_preference',
        'furnished_preference', 'desired_amenities', 'smoking_details',
        'total_household_income', 'family_composition'
    ];
    col TEXT;
BEGIN
    FOREACH col IN ARRAY expected_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'tenant_profiles' AND column_name = col
        ) THEN
            missing_columns := array_append(missing_columns, col);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'Missing columns: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'All enhanced profile fields added successfully!';
        RAISE NOTICE 'Added % new columns to tenant_profiles table', array_length(expected_columns, 1);
    END IF;
END $$;

-- Log successful migration
INSERT INTO audit_logs (action, table_name, record_id, new_values)
VALUES (
    'ENHANCED_PROFILE_MIGRATION', 
    'tenant_profiles', 
    '20250612_enhanced_fields', 
    jsonb_build_object(
        'migration_date', NOW(),
        'fields_added', jsonb_build_array(
            'nationality', 'sex', 'profile_picture_url',
            'marital_status', 'has_children', 'number_of_children', 'children_ages',
            'has_partner', 'partner_name', 'partner_profession', 'partner_monthly_income', 'partner_employment_status',
            'preferred_districts', 'max_commute_time', 'transportation_preference',
            'furnished_preference', 'desired_amenities', 'smoking_details',
            'total_household_income', 'family_composition'
        ),
        'indexes_added', jsonb_build_array(
            'idx_tenant_profiles_enhanced_search',
            'idx_tenant_profiles_family_composition',
            'idx_tenant_profiles_location_amenities',
            'idx_tenant_profiles_lifestyle'
        )
    )
);

-- Success message
RAISE NOTICE 'Enhanced profile fields migration completed successfully at %', NOW();
RAISE NOTICE 'Tenant profiles table now supports full 7-step modal data';
