-- Add enhanced profile fields to tenant_profiles table
-- This migration adds all the fields needed for the Enhanced Profile Creation Modal

-- Personal Information enhancements
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS nationality text DEFAULT 'Nederlandse';
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS sex text CHECK (sex IN ('man', 'vrouw', 'anders', 'zeg_ik_liever_niet'));

-- Family & Relationship Status
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS marital_status text DEFAULT 'single' CHECK (marital_status IN ('single', 'married', 'partnership', 'divorced', 'widowed'));
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS has_children boolean DEFAULT false;
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS number_of_children integer DEFAULT 0;
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS children_ages integer[] DEFAULT '{}';

-- Partner Information
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS has_partner boolean DEFAULT false;
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS partner_name text;
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS partner_profession text;
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS partner_monthly_income integer DEFAULT 0;
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS partner_employment_status text DEFAULT 'employed' CHECK (partner_employment_status IN ('employed', 'self_employed', 'freelance', 'student', 'unemployed'));

-- Location Preferences enhancements
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS preferred_districts text[] DEFAULT '{}';
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS max_commute_time integer DEFAULT 30;
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS transportation_preference text DEFAULT 'public_transport' CHECK (transportation_preference IN ('public_transport', 'bicycle', 'car', 'walking', 'mixed'));

-- Housing & Lifestyle Preferences enhancements
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS furnished_preference text DEFAULT 'no_preference' CHECK (furnished_preference IN ('furnished', 'unfurnished', 'no_preference'));
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS desired_amenities text[] DEFAULT '{}';

-- Enhanced lifestyle details
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS smoking_details text;
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS profile_picture_url text;

-- Add computed column for total household income
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS total_household_income integer GENERATED ALWAYS AS (
  CASE 
    WHEN has_partner = true THEN monthly_income + COALESCE(partner_monthly_income, 0)
    ELSE monthly_income
  END
) STORED;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_nationality ON tenant_profiles(nationality);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_marital_status ON tenant_profiles(marital_status);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_has_children ON tenant_profiles(has_children);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_has_partner ON tenant_profiles(has_partner);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_preferred_districts ON tenant_profiles USING GIN(preferred_districts);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_desired_amenities ON tenant_profiles USING GIN(desired_amenities);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_total_household_income ON tenant_profiles(total_household_income);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_furnished_preference ON tenant_profiles(furnished_preference);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_transportation_preference ON tenant_profiles(transportation_preference);

-- Update RLS policies to include new fields
-- The existing RLS policies should automatically cover the new fields since they're part of the same table

-- Add comments for documentation
COMMENT ON COLUMN tenant_profiles.nationality IS 'Tenant nationality for filtering and matching';
COMMENT ON COLUMN tenant_profiles.sex IS 'Gender identity of the tenant';
COMMENT ON COLUMN tenant_profiles.marital_status IS 'Current marital/relationship status';
COMMENT ON COLUMN tenant_profiles.has_children IS 'Whether the tenant has children';
COMMENT ON COLUMN tenant_profiles.number_of_children IS 'Number of children the tenant has';
COMMENT ON COLUMN tenant_profiles.children_ages IS 'Array of children ages';
COMMENT ON COLUMN tenant_profiles.has_partner IS 'Whether tenant has a partner who will live together';
COMMENT ON COLUMN tenant_profiles.partner_name IS 'Name of the partner';
COMMENT ON COLUMN tenant_profiles.partner_profession IS 'Partner profession/job';
COMMENT ON COLUMN tenant_profiles.partner_monthly_income IS 'Partner monthly gross income';
COMMENT ON COLUMN tenant_profiles.partner_employment_status IS 'Partner employment status';
COMMENT ON COLUMN tenant_profiles.preferred_districts IS 'Array of preferred districts/neighborhoods';
COMMENT ON COLUMN tenant_profiles.max_commute_time IS 'Maximum commute time to work in minutes';
COMMENT ON COLUMN tenant_profiles.transportation_preference IS 'Preferred mode of transportation';
COMMENT ON COLUMN tenant_profiles.furnished_preference IS 'Preference for furnished/unfurnished properties';
COMMENT ON COLUMN tenant_profiles.desired_amenities IS 'Array of desired property amenities';
COMMENT ON COLUMN tenant_profiles.smoking_details IS 'Detailed smoking habits and preferences';
COMMENT ON COLUMN tenant_profiles.profile_picture_url IS 'URL to tenant profile picture';
COMMENT ON COLUMN tenant_profiles.total_household_income IS 'Computed total household income including partner';
