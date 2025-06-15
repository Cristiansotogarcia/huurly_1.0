
-- Add missing high-priority fields to tenant_profiles table for enhanced matching
ALTER TABLE tenant_profiles 
ADD COLUMN IF NOT EXISTS guarantor_name TEXT,
ADD COLUMN IF NOT EXISTS guarantor_phone TEXT,
ADD COLUMN IF NOT EXISTS guarantor_income NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS guarantor_relationship TEXT,
ADD COLUMN IF NOT EXISTS income_proof_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS move_in_date_preferred DATE,
ADD COLUMN IF NOT EXISTS move_in_date_earliest DATE,
ADD COLUMN IF NOT EXISTS availability_flexible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT,
ADD COLUMN IF NOT EXISTS lease_duration_preference TEXT,
ADD COLUMN IF NOT EXISTS parking_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS work_from_home BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS storage_needs TEXT,
ADD COLUMN IF NOT EXISTS references_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rental_history_years INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reason_for_moving TEXT;

-- Add computed columns for better matching
ALTER TABLE tenant_profiles 
ADD COLUMN IF NOT EXISTS total_guaranteed_income NUMERIC GENERATED ALWAYS AS (
  COALESCE(monthly_income, 0) + 
  COALESCE(partner_monthly_income, 0) + 
  CASE WHEN guarantor_available = true THEN COALESCE(guarantor_income, 0) * 0.3 ELSE 0 END
) STORED;

-- Update existing profiles to set reasonable defaults for new fields
UPDATE tenant_profiles 
SET 
  guarantor_available = COALESCE(guarantor_available, false),
  income_proof_available = COALESCE(income_proof_available, true),
  availability_flexible = COALESCE(availability_flexible, true),
  parking_required = COALESCE(parking_required, false),
  work_from_home = COALESCE(work_from_home, false),
  references_available = COALESCE(references_available, true),
  rental_history_years = COALESCE(rental_history_years, 2)
WHERE profile_completed = true;

-- Add indexes for better query performance on new matching fields
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_guarantor_available ON tenant_profiles(guarantor_available);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_move_in_dates ON tenant_profiles(move_in_date_preferred, move_in_date_earliest);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_total_guaranteed_income ON tenant_profiles(total_guaranteed_income);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_work_from_home ON tenant_profiles(work_from_home);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_parking_required ON tenant_profiles(parking_required);

-- Create a function to automatically calculate age from date_of_birth
CREATE OR REPLACE FUNCTION calculate_age_from_dob(date_of_birth DATE)
RETURNS INTEGER AS $$
BEGIN
  IF date_of_birth IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN EXTRACT(YEAR FROM age(CURRENT_DATE, date_of_birth));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add a computed age column that auto-calculates from date_of_birth
ALTER TABLE tenant_profiles 
ADD COLUMN IF NOT EXISTS computed_age INTEGER GENERATED ALWAYS AS (
  calculate_age_from_dob(date_of_birth)
) STORED;

-- Create index on computed age for filtering
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_computed_age ON tenant_profiles(computed_age);

-- Add comments for documentation
COMMENT ON COLUMN tenant_profiles.guarantor_name IS 'Full name of guarantor/borg person';
COMMENT ON COLUMN tenant_profiles.guarantor_phone IS 'Contact phone number of guarantor';
COMMENT ON COLUMN tenant_profiles.guarantor_income IS 'Monthly income of guarantor in euros';
COMMENT ON COLUMN tenant_profiles.guarantor_relationship IS 'Relationship to guarantor (ouder, familie, vriend, werkgever, anders)';
COMMENT ON COLUMN tenant_profiles.income_proof_available IS 'Whether tenant can provide income documentation';
COMMENT ON COLUMN tenant_profiles.move_in_date_preferred IS 'Preferred move-in date';
COMMENT ON COLUMN tenant_profiles.move_in_date_earliest IS 'Earliest possible move-in date';
COMMENT ON COLUMN tenant_profiles.availability_flexible IS 'Whether tenant is flexible with move-in timing';
COMMENT ON COLUMN tenant_profiles.total_guaranteed_income IS 'Total household income including guarantor factor (computed)';
COMMENT ON COLUMN tenant_profiles.computed_age IS 'Auto-calculated age from date_of_birth (computed)';
COMMENT ON COLUMN tenant_profiles.emergency_contact_name IS 'Emergency contact full name';
COMMENT ON COLUMN tenant_profiles.emergency_contact_phone IS 'Emergency contact phone number';
COMMENT ON COLUMN tenant_profiles.emergency_contact_relationship IS 'Relationship to emergency contact';
COMMENT ON COLUMN tenant_profiles.lease_duration_preference IS 'Preferred lease duration (6 months, 1 year, 2+ year)';
COMMENT ON COLUMN tenant_profiles.parking_required IS 'Whether tenant requires parking space';
COMMENT ON COLUMN tenant_profiles.work_from_home IS 'Whether tenant works from home (affects space needs)';
COMMENT ON COLUMN tenant_profiles.storage_needs IS 'Storage/berging requirements description';
COMMENT ON COLUMN tenant_profiles.references_available IS 'Whether tenant can provide rental references';
COMMENT ON COLUMN tenant_profiles.rental_history_years IS 'Years of rental experience';
COMMENT ON COLUMN tenant_profiles.reason_for_moving IS 'Reason for seeking new accommodation';
