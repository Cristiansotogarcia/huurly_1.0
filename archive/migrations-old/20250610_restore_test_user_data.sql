-- Restore test user data that was deleted during database reset
-- This migration restores the test user and their associated data

-- Insert test user profile (using service role to bypass RLS)
INSERT INTO profiles (id, first_name, last_name, created_at, updated_at) 
VALUES (
  '1c655825-9713-4ecc-80e3-a77701914d3a', 
  'Test', 
  'User', 
  NOW(), 
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();

-- Insert test user role
INSERT INTO user_roles (user_id, role, subscription_status, created_at) 
VALUES (
  '1c655825-9713-4ecc-80e3-a77701914d3a', 
  'Huurder', 
  'active', 
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  subscription_status = EXCLUDED.subscription_status;

-- Insert test payment record
INSERT INTO payment_records (
  user_id, 
  email,
  user_type,
  stripe_session_id, 
  stripe_payment_intent_id, 
  amount, 
  currency, 
  status,
  subscription_type,
  created_at, 
  updated_at
) 
VALUES (
  '1c655825-9713-4ecc-80e3-a77701914d3a',
  'test@example.com',
  'Huurder',
  'cs_test_completed_session', 
  'pi_test_completed_payment', 
  2500, 
  'eur', 
  'completed',
  'huurder_yearly',
  NOW(), 
  NOW()
)
ON CONFLICT (stripe_session_id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = NOW();

-- Insert test subscriber record
INSERT INTO subscribers (
  user_id,
  email,
  subscribed,
  subscription_tier,
  subscription_end,
  created_at,
  updated_at
)
VALUES (
  '1c655825-9713-4ecc-80e3-a77701914d3a',
  'test@example.com',
  true,
  'huurder_yearly',
  NOW() + INTERVAL '1 year',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  subscribed = EXCLUDED.subscribed,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_end = EXCLUDED.subscription_end,
  updated_at = NOW();

-- Add any other test data that might be needed
-- Create a basic tenant profile for the test user
INSERT INTO tenant_profiles (
  user_id,
  first_name,
  last_name,
  age,
  employment_status,
  monthly_income,
  max_rent,
  preferred_location,
  household_size,
  documents_verified,
  created_at,
  updated_at
)
VALUES (
  '1c655825-9713-4ecc-80e3-a77701914d3a',
  'Test',
  'User',
  30,
  'employed',
  3000.00,
  1500.00,
  'Amsterdam',
  1,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();

COMMENT ON TABLE profiles IS 'Test user profile restored';
COMMENT ON TABLE user_roles IS 'Test user role restored with active subscription';
COMMENT ON TABLE payment_records IS 'Test payment record restored';
COMMENT ON TABLE subscribers IS 'Test subscriber record restored';
COMMENT ON TABLE tenant_profiles IS 'Test tenant profile restored';
