-- Insert test data with proper Dutch roles
-- This migration restores the test users and data that were deleted

-- First, insert test users directly into auth.users (using service role privileges)
-- Note: This is a special case for restoring test data

-- Insert the main test user
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '1c655825-9713-4ecc-80e3-a77701914d3a',
  'test@example.com',
  '$2a$10$dummy.encrypted.password.hash.for.testing.purposes.only',
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Test", "last_name": "User"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Insert additional test users for different roles
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, 
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role
) VALUES 
  (
    '2c655825-9713-4ecc-80e3-a77701914d3b',
    'verhuurder@example.com',
    '$2a$10$dummy.encrypted.password.hash.for.testing.purposes.only',
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Jan", "last_name": "Verhuurder"}',
    false, 'authenticated'
  ),
  (
    '3c655825-9713-4ecc-80e3-a77701914d3c',
    'beoordelaar@example.com',
    '$2a$10$dummy.encrypted.password.hash.for.testing.purposes.only',
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Marie", "last_name": "Beoordelaar"}',
    false, 'authenticated'
  ),
  (
    '4c655825-9713-4ecc-80e3-a77701914d3d',
    'beheerder@example.com',
    '$2a$10$dummy.encrypted.password.hash.for.testing.purposes.only',
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Admin", "last_name": "Beheerder"}',
    false, 'authenticated'
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- Insert profiles for all test users
INSERT INTO profiles (id, first_name, last_name, created_at, updated_at) VALUES
  ('1c655825-9713-4ecc-80e3-a77701914d3a', 'Test', 'User', NOW(), NOW()),
  ('2c655825-9713-4ecc-80e3-a77701914d3b', 'Jan', 'Verhuurder', NOW(), NOW()),
  ('3c655825-9713-4ecc-80e3-a77701914d3c', 'Marie', 'Beoordelaar', NOW(), NOW()),
  ('4c655825-9713-4ecc-80e3-a77701914d3d', 'Admin', 'Beheerder', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();

-- Insert user roles with proper Dutch role names
INSERT INTO user_roles (user_id, role, subscription_status, subscription_start_date, subscription_end_date, created_at) VALUES
  (
    '1c655825-9713-4ecc-80e3-a77701914d3a', 
    'Huurder', 
    'active',
    NOW(),
    NOW() + INTERVAL '1 year',
    NOW()
  ),
  (
    '2c655825-9713-4ecc-80e3-a77701914d3b', 
    'Verhuurder', 
    'active',
    NOW(),
    NOW() + INTERVAL '1 year',
    NOW()
  ),
  (
    '3c655825-9713-4ecc-80e3-a77701914d3c', 
    'Beoordelaar', 
    'active',
    NOW(),
    NOW() + INTERVAL '1 year',
    NOW()
  ),
  (
    '4c655825-9713-4ecc-80e3-a77701914d3d', 
    'Beheerder', 
    'active',
    NOW(),
    NOW() + INTERVAL '1 year',
    NOW()
  )
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  subscription_status = EXCLUDED.subscription_status,
  subscription_start_date = EXCLUDED.subscription_start_date,
  subscription_end_date = EXCLUDED.subscription_end_date;

-- Insert payment record for the main test user (Huurder)
INSERT INTO payment_records (
  user_id, 
  stripe_session_id, 
  stripe_payment_intent_id, 
  amount, 
  currency, 
  status,
  subscription_type,
  payment_method,
  created_at, 
  updated_at
) VALUES (
  '1c655825-9713-4ecc-80e3-a77701914d3a',
  'cs_test_completed_session', 
  'pi_test_completed_payment', 
  6500, -- €65.00 in cents (as found in create-checkout-session)
  'eur', 
  'completed',
  'huurder_yearly',
  'card',
  NOW(), 
  NOW()
) ON CONFLICT (stripe_session_id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = NOW();

-- Insert subscriber record for the main test user
INSERT INTO subscribers (
  user_id,
  email,
  subscribed,
  subscription_tier,
  subscription_end,
  created_at,
  updated_at
) VALUES (
  '1c655825-9713-4ecc-80e3-a77701914d3a',
  'test@example.com',
  true,
  'huurder_yearly',
  NOW() + INTERVAL '1 year',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  subscribed = EXCLUDED.subscribed,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_end = EXCLUDED.subscription_end,
  updated_at = NOW();

-- Insert tenant profile for the Huurder test user (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenant_profiles') THEN
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
        ) VALUES (
          '1c655825-9713-4ecc-80e3-a77701914d3a',
          'Test',
          'User',
          30,
          'employed',
          4500.00, -- As found in payslip simulation
          1500.00,
          'Amsterdam',
          1,
          true,
          NOW(),
          NOW()
        ) ON CONFLICT (user_id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          updated_at = NOW();
    END IF;
END $$;

-- Insert some sample properties for the Verhuurder test user (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'properties') THEN
        INSERT INTO properties (
          id,
          landlord_id,
          title,
          description,
          address,
          city,
          postal_code,
          price,
          bedrooms,
          bathrooms,
          area,
          property_type,
          status,
          created_at,
          updated_at
        ) VALUES 
          (
            'prop-1-test-amsterdam',
            '2c655825-9713-4ecc-80e3-a77701914d3b',
            'Modern Apartment in Amsterdam Center',
            'Beautiful 2-bedroom apartment in the heart of Amsterdam with modern amenities.',
            'Damrak 123',
            'Amsterdam',
            '1012 AB',
            1400.00,
            2,
            1,
            75.0,
            'apartment',
            'available',
            NOW(),
            NOW()
          ),
          (
            'prop-2-test-utrecht',
            '2c655825-9713-4ecc-80e3-a77701914d3b',
            'Cozy House in Utrecht',
            'Charming 3-bedroom house with garden in quiet neighborhood.',
            'Oudegracht 456',
            'Utrecht',
            '3511 AB',
            1200.00,
            3,
            2,
            95.0,
            'house',
            'available',
            NOW(),
            NOW()
          )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          updated_at = NOW();
    END IF;
END $$;

-- Insert some sample documents for the Huurder (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_documents') THEN
        INSERT INTO user_documents (
          id,
          user_id,
          document_type,
          file_name,
          file_url,
          status,
          uploaded_at,
          reviewed_at,
          created_at,
          updated_at
        ) VALUES 
          (
            'doc-1-identity-test',
            '1c655825-9713-4ecc-80e3-a77701914d3a',
            'identity',
            'identity_card_test_user.pdf',
            '/documents/identity_card_test_user.pdf',
            'approved',
            NOW() - INTERVAL '2 days',
            NOW() - INTERVAL '1 day',
            NOW(),
            NOW()
          ),
          (
            'doc-2-payslip-test',
            '1c655825-9713-4ecc-80e3-a77701914d3a',
            'payslip',
            'payslip_december_2023.pdf',
            '/documents/payslip_december_2023.pdf',
            'approved',
            NOW() - INTERVAL '2 days',
            NOW() - INTERVAL '1 day',
            NOW(),
            NOW()
          )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          updated_at = NOW();
    END IF;
END $$;

-- Insert some sample notifications (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        INSERT INTO notifications (
          id,
          user_id,
          type,
          title,
          message,
          read,
          created_at
        ) VALUES 
          (
            'notif-1-welcome-huurder',
            '1c655825-9713-4ecc-80e3-a77701914d3a',
            'welcome',
            'Welkom bij Huurly!',
            'Je account is succesvol aangemaakt. Je kunt nu beginnen met zoeken naar je ideale woning.',
            false,
            NOW()
          ),
          (
            'notif-2-docs-approved',
            '1c655825-9713-4ecc-80e3-a77701914d3a',
            'document_approved',
            'Documenten goedgekeurd',
            'Je identiteitsbewijs en loonstrook zijn goedgekeurd. Je profiel is nu volledig geverifieerd.',
            false,
            NOW() - INTERVAL '1 day'
          ),
          (
            'notif-3-welcome-verhuurder',
            '2c655825-9713-4ecc-80e3-a77701914d3b',
            'welcome',
            'Welkom bij Huurly!',
            'Je verhuurder account is aangemaakt. Je kunt nu panden toevoegen en huurders vinden.',
            false,
            NOW()
          )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          message = EXCLUDED.message;
    END IF;
END $$;

-- Add audit log entries for the test data creation
INSERT INTO audit_logs (
  user_id,
  action,
  table_name,
  record_id,
  new_values,
  created_at
) VALUES 
  (
    '1c655825-9713-4ecc-80e3-a77701914d3a',
    'INSERT',
    'profiles',
    '1c655825-9713-4ecc-80e3-a77701914d3a',
    '{"first_name": "Test", "last_name": "User", "role": "Huurder"}',
    NOW()
  ),
  (
    '2c655825-9713-4ecc-80e3-a77701914d3b',
    'INSERT',
    'profiles',
    '2c655825-9713-4ecc-80e3-a77701914d3b',
    '{"first_name": "Jan", "last_name": "Verhuurder", "role": "Verhuurder"}',
    NOW()
  ),
  (
    '3c655825-9713-4ecc-80e3-a77701914d3c',
    'INSERT',
    'profiles',
    '3c655825-9713-4ecc-80e3-a77701914d3c',
    '{"first_name": "Marie", "last_name": "Beoordelaar", "role": "Beoordelaar"}',
    NOW()
  ),
  (
    '4c655825-9713-4ecc-80e3-a77701914d3d',
    'INSERT',
    'profiles',
    '4c655825-9713-4ecc-80e3-a77701914d3d',
    '{"first_name": "Admin", "last_name": "Beheerder", "role": "Beheerder"}',
    NOW()
  );

-- Add comments explaining the test data
COMMENT ON TABLE profiles IS 'Test users restored: Huurder, Verhuurder, Beoordelaar, Beheerder';
COMMENT ON TABLE user_roles IS 'Test user roles with proper Dutch names and active subscriptions';
COMMENT ON TABLE payment_records IS 'Test payment record for Huurder with €65 yearly subscription';
COMMENT ON TABLE subscribers IS 'Test subscriber record for Stripe integration';

-- Final verification query (commented out for migration)
-- SELECT 
--   p.first_name, 
--   p.last_name, 
--   ur.role, 
--   ur.subscription_status,
--   pr.amount,
--   pr.status as payment_status
-- FROM profiles p
-- LEFT JOIN user_roles ur ON p.id = ur.user_id
-- LEFT JOIN payment_records pr ON p.id = pr.user_id
-- ORDER BY ur.role;
