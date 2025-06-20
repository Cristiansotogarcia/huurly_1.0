
-- First, let's completely remove any existing constraint
ALTER TABLE tenant_profiles DROP CONSTRAINT IF EXISTS tenant_profiles_furnished_preference_check;

-- Set ALL furnished_preference values to NULL first to avoid any constraint issues
UPDATE tenant_profiles SET furnished_preference = NULL;

-- Now set the default value for all rows
UPDATE tenant_profiles SET furnished_preference = 'geen_voorkeur';

-- Add the new constraint with Dutch values
ALTER TABLE tenant_profiles 
ADD CONSTRAINT tenant_profiles_furnished_preference_check 
CHECK (furnished_preference IN ('gemeubileerd', 'ongemeubileerd', 'geen_voorkeur'));

-- Verify the constraint works by checking all distinct values
SELECT DISTINCT furnished_preference, COUNT(*) 
FROM tenant_profiles 
WHERE furnished_preference IS NOT NULL
GROUP BY furnished_preference;
