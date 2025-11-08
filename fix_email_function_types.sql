-- Fix type mismatch in email sequence functions
-- The auth.users.email column is varchar(255), not text
-- Run this in your Supabase SQL Editor

-- Drop and recreate get_unpaid_verified_users with correct types
DROP FUNCTION IF EXISTS get_unpaid_verified_users();

CREATE OR REPLACE FUNCTION get_unpaid_verified_users()
RETURNS TABLE (
  id uuid,
  email varchar(255),  -- Changed from text to varchar(255)
  email_confirmed_at timestamptz,
  created_at timestamptz,
  raw_user_meta_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email::varchar(255),  -- Cast to match return type
    u.email_confirmed_at,
    u.created_at,
    u.raw_user_meta_data
  FROM auth.users u
  LEFT JOIN public.abonnementen a ON u.id = a.huurder_id AND a.status = 'actief'
  WHERE u.email_confirmed_at IS NOT NULL
    AND a.id IS NULL -- No active subscription
  ORDER BY u.email_confirmed_at DESC;
END;
$$;

-- Drop and recreate get_paid_incomplete_users with correct types
DROP FUNCTION IF EXISTS get_paid_incomplete_users();

CREATE OR REPLACE FUNCTION get_paid_incomplete_users()
RETURNS TABLE (
  id uuid,
  email varchar(255),  -- Changed from text to varchar(255)
  created_at timestamptz,
  raw_user_meta_data jsonb,
  profiel_compleet boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email::varchar(255),  -- Cast to match return type
    u.created_at,
    u.raw_user_meta_data,
    COALESCE(g.profiel_compleet, false) as profiel_compleet
  FROM auth.users u
  INNER JOIN public.abonnementen a ON u.id = a.huurder_id AND a.status = 'actief'
  INNER JOIN public.gebruikers g ON u.id = g.id
  WHERE COALESCE(g.profiel_compleet, false) = false
  ORDER BY u.created_at DESC;
END;
$$;

-- Re-grant permissions
GRANT EXECUTE ON FUNCTION get_unpaid_verified_users() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_paid_incomplete_users() TO authenticated, service_role;

-- Test the functions work now
SELECT 'Testing get_unpaid_verified_users()' as test;
SELECT COUNT(*) as unpaid_count FROM get_unpaid_verified_users();

SELECT 'Testing get_paid_incomplete_users()' as test;
SELECT COUNT(*) as incomplete_count FROM get_paid_incomplete_users();

-- Now you can run the diagnostic queries
SELECT 
  'Unverified Users (2+ days)' as category,
  COUNT(*) as count
FROM auth.users
WHERE email_confirmed_at IS NULL AND created_at < NOW() - INTERVAL '2 days'

UNION ALL

SELECT 
  'Unpaid Verified Users',
  COUNT(*)
FROM get_unpaid_verified_users()

UNION ALL

SELECT 
  'Paid Incomplete Users',
  COUNT(*)
FROM get_paid_incomplete_users()

UNION ALL

SELECT 
  'Recent Email Sends',
  COUNT(*)
FROM email_sequence_log
WHERE sent_at > NOW() - INTERVAL '24 hours';
