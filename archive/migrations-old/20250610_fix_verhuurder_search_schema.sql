-- Fix Verhuurder Search Schema Issues
-- This migration fixes the schema mismatches preventing the tenant search from working

-- 1. Add missing is_looking_for_place column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_looking_for_place BOOLEAN DEFAULT true;

-- 2. Add missing profile_completed column to tenant_profiles table
ALTER TABLE tenant_profiles 
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT true;

-- 3. Add missing fields that UserService expects in tenant_profiles
ALTER TABLE tenant_profiles 
ADD COLUMN IF NOT EXISTS preferred_city TEXT,
ADD COLUMN IF NOT EXISTS min_budget DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS max_budget DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS preferred_property_type TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 4. Update existing records with proper default values
UPDATE profiles 
SET is_looking_for_place = true 
WHERE is_looking_for_place IS NULL;

UPDATE tenant_profiles 
SET profile_completed = true 
WHERE profile_completed IS NULL;

-- 5. Migrate data from existing fields to new expected field names
UPDATE tenant_profiles 
SET 
    preferred_city = COALESCE(preferred_location, preferred_city),
    max_budget = COALESCE(max_rent, max_budget),
    min_budget = COALESCE(max_rent * 0.7, min_budget) -- Estimate min as 70% of max
WHERE preferred_city IS NULL OR max_budget IS NULL;

-- 6. Ensure RLS policies allow Verhuurders to query tenant profiles with joins
DROP POLICY IF EXISTS "Verhuurders can view tenant profiles" ON tenant_profiles;
CREATE POLICY "Verhuurders can view tenant profiles" ON tenant_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Verhuurder', 'Beoordelaar', 'Beheerder')
        )
    );

-- 7. Ensure profiles table allows joins for tenant search
DROP POLICY IF EXISTS "Allow tenant profile joins" ON profiles;
CREATE POLICY "Allow tenant profile joins" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Verhuurder', 'Beoordelaar', 'Beheerder')
        )
        OR auth.uid() = id
    );

-- 8. Add indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_preferred_city ON tenant_profiles(preferred_city);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_max_budget ON tenant_profiles(max_budget);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_monthly_income ON tenant_profiles(monthly_income);
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_profile_completed ON tenant_profiles(profile_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_is_looking_for_place ON profiles(is_looking_for_place);

-- 9. Create a view for easier tenant searching (optional optimization)
CREATE OR REPLACE VIEW tenant_search_view AS
SELECT 
    tp.*,
    p.id as profile_id,
    p.first_name as profile_first_name,
    p.last_name as profile_last_name,
    p.is_looking_for_place,
    p.created_at as profile_created_at
FROM tenant_profiles tp
INNER JOIN profiles p ON tp.user_id = p.id
WHERE tp.profile_completed = true
AND p.is_looking_for_place = true;

-- 10. Grant access to the view
GRANT SELECT ON tenant_search_view TO authenticated;

COMMENT ON MIGRATION IS 'Fixes schema mismatches for Verhuurder tenant search functionality';
