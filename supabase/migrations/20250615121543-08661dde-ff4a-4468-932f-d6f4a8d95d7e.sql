
-- First, let's analyze which columns in tenant_profiles contain only NULL values
-- This query will check each column and count non-null values

WITH column_stats AS (
  SELECT 
    'user_id' as column_name, COUNT(*) as total_rows, COUNT(user_id) as non_null_count FROM tenant_profiles
  UNION ALL
  SELECT 'id', COUNT(*), COUNT(id) FROM tenant_profiles
  UNION ALL
  SELECT 'age', COUNT(*), COUNT(age) FROM tenant_profiles
  UNION ALL
  SELECT 'monthly_income', COUNT(*), COUNT(monthly_income) FROM tenant_profiles
  UNION ALL
  SELECT 'housing_allowance_eligible', COUNT(*), COUNT(housing_allowance_eligible) FROM tenant_profiles
  UNION ALL
  SELECT 'guarantor_available', COUNT(*), COUNT(guarantor_available) FROM tenant_profiles
  UNION ALL
  SELECT 'preferred_radius', COUNT(*), COUNT(preferred_radius) FROM tenant_profiles
  UNION ALL
  SELECT 'preferred_bedrooms', COUNT(*), COUNT(preferred_bedrooms) FROM tenant_profiles
  UNION ALL
  SELECT 'max_rent', COUNT(*), COUNT(max_rent) FROM tenant_profiles
  UNION ALL
  SELECT 'available_from', COUNT(*), COUNT(available_from) FROM tenant_profiles
  UNION ALL
  SELECT 'household_size', COUNT(*), COUNT(household_size) FROM tenant_profiles
  UNION ALL
  SELECT 'has_pets', COUNT(*), COUNT(has_pets) FROM tenant_profiles
  UNION ALL
  SELECT 'smokes', COUNT(*), COUNT(smokes) FROM tenant_profiles
  UNION ALL
  SELECT 'documents_verified', COUNT(*), COUNT(documents_verified) FROM tenant_profiles
  UNION ALL
  SELECT 'profile_completion_percentage', COUNT(*), COUNT(profile_completion_percentage) FROM tenant_profiles
  UNION ALL
  SELECT 'profile_views', COUNT(*), COUNT(profile_views) FROM tenant_profiles
  UNION ALL
  SELECT 'landlord_interest', COUNT(*), COUNT(landlord_interest) FROM tenant_profiles
  UNION ALL
  SELECT 'created_at', COUNT(*), COUNT(created_at) FROM tenant_profiles
  UNION ALL
  SELECT 'updated_at', COUNT(*), COUNT(updated_at) FROM tenant_profiles
  UNION ALL
  SELECT 'date_of_birth', COUNT(*), COUNT(date_of_birth) FROM tenant_profiles
  UNION ALL
  SELECT 'min_budget', COUNT(*), COUNT(min_budget) FROM tenant_profiles
  UNION ALL
  SELECT 'max_budget', COUNT(*), COUNT(max_budget) FROM tenant_profiles
  UNION ALL
  SELECT 'profile_completed', COUNT(*), COUNT(profile_completed) FROM tenant_profiles
  UNION ALL
  SELECT 'has_children', COUNT(*), COUNT(has_children) FROM tenant_profiles
  UNION ALL
  SELECT 'number_of_children', COUNT(*), COUNT(number_of_children) FROM tenant_profiles
  UNION ALL
  SELECT 'has_partner', COUNT(*), COUNT(has_partner) FROM tenant_profiles
  UNION ALL
  SELECT 'partner_monthly_income', COUNT(*), COUNT(partner_monthly_income) FROM tenant_profiles
  UNION ALL
  SELECT 'max_commute_time', COUNT(*), COUNT(max_commute_time) FROM tenant_profiles
  UNION ALL
  SELECT 'total_household_income', COUNT(*), COUNT(total_household_income) FROM tenant_profiles
  UNION ALL
  SELECT 'children_ages', COUNT(*), COUNT(children_ages) FROM tenant_profiles
  UNION ALL
  SELECT 'guarantor_income', COUNT(*), COUNT(guarantor_income) FROM tenant_profiles
  UNION ALL
  SELECT 'income_proof_available', COUNT(*), COUNT(income_proof_available) FROM tenant_profiles
  UNION ALL
  SELECT 'move_in_date_preferred', COUNT(*), COUNT(move_in_date_preferred) FROM tenant_profiles
  UNION ALL
  SELECT 'move_in_date_earliest', COUNT(*), COUNT(move_in_date_earliest) FROM tenant_profiles
  UNION ALL
  SELECT 'availability_flexible', COUNT(*), COUNT(availability_flexible) FROM tenant_profiles
  UNION ALL
  SELECT 'parking_required', COUNT(*), COUNT(parking_required) FROM tenant_profiles
  UNION ALL
  SELECT 'work_from_home', COUNT(*), COUNT(work_from_home) FROM tenant_profiles
  UNION ALL
  SELECT 'references_available', COUNT(*), COUNT(references_available) FROM tenant_profiles
  UNION ALL
  SELECT 'rental_history_years', COUNT(*), COUNT(rental_history_years) FROM tenant_profiles
  UNION ALL
  SELECT 'total_guaranteed_income', COUNT(*), COUNT(total_guaranteed_income) FROM tenant_profiles
  UNION ALL
  SELECT 'computed_age', COUNT(*), COUNT(computed_age) FROM tenant_profiles
  UNION ALL
  SELECT 'first_name', COUNT(*), COUNT(first_name) FROM tenant_profiles
  UNION ALL
  SELECT 'last_name', COUNT(*), COUNT(last_name) FROM tenant_profiles
  UNION ALL
  SELECT 'profession', COUNT(*), COUNT(profession) FROM tenant_profiles
  UNION ALL
  SELECT 'employer', COUNT(*), COUNT(employer) FROM tenant_profiles
  UNION ALL
  SELECT 'employment_status', COUNT(*), COUNT(employment_status) FROM tenant_profiles
  UNION ALL
  SELECT 'work_contract_type', COUNT(*), COUNT(work_contract_type) FROM tenant_profiles
  UNION ALL
  SELECT 'bio', COUNT(*), COUNT(bio) FROM tenant_profiles
  UNION ALL
  SELECT 'motivation', COUNT(*), COUNT(motivation) FROM tenant_profiles
  UNION ALL
  SELECT 'rental_history', COUNT(*), COUNT(rental_history) FROM tenant_profiles
  UNION ALL
  SELECT 'current_housing_situation', COUNT(*), COUNT(current_housing_situation) FROM tenant_profiles
  UNION ALL
  SELECT 'preferred_location', COUNT(*), COUNT(preferred_location) FROM tenant_profiles
  UNION ALL
  SELECT 'move_in_flexibility', COUNT(*), COUNT(move_in_flexibility) FROM tenant_profiles
  UNION ALL
  SELECT 'contract_type', COUNT(*), COUNT(contract_type) FROM tenant_profiles
  UNION ALL
  SELECT 'household_composition', COUNT(*), COUNT(household_composition) FROM tenant_profiles
  UNION ALL
  SELECT 'pet_details', COUNT(*), COUNT(pet_details) FROM tenant_profiles
  UNION ALL
  SELECT 'pet_policy_preference', COUNT(*), COUNT(pet_policy_preference) FROM tenant_profiles
  UNION ALL
  SELECT 'smoking_policy_preference', COUNT(*), COUNT(smoking_policy_preference) FROM tenant_profiles
  UNION ALL
  SELECT 'profile_picture_url', COUNT(*), COUNT(profile_picture_url) FROM tenant_profiles
  UNION ALL
  SELECT 'phone', COUNT(*), COUNT(phone) FROM tenant_profiles
  UNION ALL
  SELECT 'preferred_city', COUNT(*), COUNT(preferred_city) FROM tenant_profiles
  UNION ALL
  SELECT 'preferred_property_type', COUNT(*), COUNT(preferred_property_type) FROM tenant_profiles
  UNION ALL
  SELECT 'marital_status', COUNT(*), COUNT(marital_status) FROM tenant_profiles
  UNION ALL
  SELECT 'partner_name', COUNT(*), COUNT(partner_name) FROM tenant_profiles
  UNION ALL
  SELECT 'partner_profession', COUNT(*), COUNT(partner_profession) FROM tenant_profiles
  UNION ALL
  SELECT 'partner_employment_status', COUNT(*), COUNT(partner_employment_status) FROM tenant_profiles
  UNION ALL
  SELECT 'nationality', COUNT(*), COUNT(nationality) FROM tenant_profiles
  UNION ALL
  SELECT 'preferred_districts', COUNT(*), COUNT(preferred_districts) FROM tenant_profiles
  UNION ALL
  SELECT 'transportation_preference', COUNT(*), COUNT(transportation_preference) FROM tenant_profiles
  UNION ALL
  SELECT 'furnished_preference', COUNT(*), COUNT(furnished_preference) FROM tenant_profiles
  UNION ALL
  SELECT 'desired_amenities', COUNT(*), COUNT(desired_amenities) FROM tenant_profiles
  UNION ALL
  SELECT 'family_composition', COUNT(*), COUNT(family_composition) FROM tenant_profiles
  UNION ALL
  SELECT 'sex', COUNT(*), COUNT(sex) FROM tenant_profiles
  UNION ALL
  SELECT 'smoking_details', COUNT(*), COUNT(smoking_details) FROM tenant_profiles
  UNION ALL
  SELECT 'guarantor_name', COUNT(*), COUNT(guarantor_name) FROM tenant_profiles
  UNION ALL
  SELECT 'guarantor_phone', COUNT(*), COUNT(guarantor_phone) FROM tenant_profiles
  UNION ALL
  SELECT 'guarantor_relationship', COUNT(*), COUNT(guarantor_relationship) FROM tenant_profiles
  UNION ALL
  SELECT 'emergency_contact_name', COUNT(*), COUNT(emergency_contact_name) FROM tenant_profiles
  UNION ALL
  SELECT 'emergency_contact_phone', COUNT(*), COUNT(emergency_contact_phone) FROM tenant_profiles
  UNION ALL
  SELECT 'emergency_contact_relationship', COUNT(*), COUNT(emergency_contact_relationship) FROM tenant_profiles
  UNION ALL
  SELECT 'lease_duration_preference', COUNT(*), COUNT(lease_duration_preference) FROM tenant_profiles
  UNION ALL
  SELECT 'storage_needs', COUNT(*), COUNT(storage_needs) FROM tenant_profiles
  UNION ALL
  SELECT 'reason_for_moving', COUNT(*), COUNT(reason_for_moving) FROM tenant_profiles
)
SELECT 
  column_name,
  total_rows,
  non_null_count,
  (total_rows - non_null_count) as null_count,
  CASE 
    WHEN non_null_count = 0 THEN '🗑️ COMPLETELY EMPTY - CAN BE DELETED'
    WHEN non_null_count < total_rows * 0.1 THEN '⚠️ MOSTLY EMPTY (< 10% usage)'
    WHEN non_null_count < total_rows * 0.5 THEN '📊 PARTIALLY USED (< 50% usage)'
    ELSE '✅ WELL USED (>= 50% usage)'
  END as usage_status,
  ROUND((non_null_count::decimal / total_rows::decimal) * 100, 2) as usage_percentage
FROM column_stats
ORDER BY non_null_count ASC, column_name;

-- Get some sample data to understand what's actually being stored
SELECT 
  'Sample data from tenant_profiles:' as info,
  COUNT(*) as total_records
FROM tenant_profiles;

-- Show a few sample records with key fields
SELECT 
  first_name,
  last_name,
  profession,
  monthly_income,
  preferred_city,
  max_budget,
  profile_completed,
  guarantor_available,
  move_in_date_preferred,
  created_at
FROM tenant_profiles 
WHERE profile_completed = true
ORDER BY created_at DESC 
LIMIT 3;
