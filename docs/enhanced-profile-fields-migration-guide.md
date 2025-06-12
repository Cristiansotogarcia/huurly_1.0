# Enhanced Profile Fields Migration Guide

## Overview
This guide provides instructions to add all missing enhanced fields to the `tenant_profiles` table to support the complete 7-step profile modal functionality.

## Problem
The 7-step profile modal was failing with 400 Bad Request errors because it was trying to save enhanced fields that don't exist in the database schema.

## Solution
Add 20 new columns to the `tenant_profiles` table to support all enhanced profile data.

## Manual Migration Instructions

### Step 1: Access Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/lxtkotgfsnahwncgcfnl/sql
2. Log in to your Supabase account
3. Navigate to the SQL Editor

### Step 2: Execute Migration SQL
Copy and paste the following SQL into the SQL Editor and execute it:

```sql
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

-- Success message
SELECT 'Enhanced profile fields migration completed successfully!' as result;
```

### Step 3: Verify Migration
After executing the SQL, run this verification query:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tenant_profiles' 
AND column_name IN (
    'nationality', 'sex', 'marital_status', 'has_children', 'number_of_children',
    'children_ages', 'has_partner', 'partner_name', 'partner_profession',
    'partner_monthly_income', 'partner_employment_status', 'preferred_districts',
    'max_commute_time', 'transportation_preference', 'furnished_preference',
    'desired_amenities', 'smoking_details', 'total_household_income', 'family_composition'
)
ORDER BY column_name;
```

You should see 19 rows returned if all fields were added successfully.

## What This Migration Adds

### 20 New Columns:
1. **nationality** - Tenant nationality (default: 'Nederlandse')
2. **sex** - Gender identity (optional)
3. **profile_picture_url** - Profile picture URL
4. **marital_status** - Marital status (default: 'single')
5. **has_children** - Whether tenant has children (default: false)
6. **number_of_children** - Number of children (default: 0)
7. **children_ages** - Ages of children as JSON array
8. **has_partner** - Whether tenant has a partner (default: false)
9. **partner_name** - Partner name
10. **partner_profession** - Partner profession
11. **partner_monthly_income** - Partner monthly income (default: 0)
12. **partner_employment_status** - Partner employment status
13. **preferred_districts** - Preferred districts as JSON array
14. **max_commute_time** - Maximum commute time (default: 30)
15. **transportation_preference** - Transportation preference (default: 'public_transport')
16. **furnished_preference** - Furnished preference (default: 'no_preference')
17. **desired_amenities** - Desired amenities as JSON array
18. **smoking_details** - Smoking habits and details
19. **total_household_income** - Computed total household income
20. **family_composition** - Computed family composition type

### 4 New Indexes:
- Enhanced search index for nationality, marital status, children, partner
- Family composition and income index
- GIN index for location and amenities arrays
- Lifestyle preferences index

## After Migration
Once the migration is complete, the profile editing functionality will work without errors and support all enhanced fields from the 7-step modal.

## Verification
Test the profile editing by:
1. Logging in as a tenant
2. Clicking "Profiel bewerken"
3. Going through all 7 steps
4. Clicking "Profiel Bewerken" in step 7
5. Verifying success message appears

## Troubleshooting
If you encounter any issues:
1. Check that all 20 columns were added
2. Verify the indexes were created
3. Ensure existing data was updated with defaults
4. Test with a simple profile update first
