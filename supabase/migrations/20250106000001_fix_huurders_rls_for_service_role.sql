-- Fix RLS policy for huurders table to allow service_role operations
-- This fixes the user creation error in production where service_role cannot insert into huurders table

-- Drop existing policy
DROP POLICY IF EXISTS "Eigen huurder" ON public.huurders;

-- Create new policy that allows service_role operations
CREATE POLICY "Eigen huurder" ON public.huurders
  FOR ALL USING (
    -- Allow users to access their own records
    auth.uid() = id 
    OR 
    -- Allow service_role to perform operations (for user registration)
    auth.jwt() ->> 'role' = 'service_role'
  ) 
  WITH CHECK (
    -- Allow users to modify their own records
    auth.uid() = id 
    OR 
    -- Allow service_role to create/modify records (for user registration)
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Also update the gebruikers table policy to ensure consistency
DROP POLICY IF EXISTS "Eigen gebruiker" ON public.gebruikers;

CREATE POLICY "Eigen gebruiker" ON public.gebruikers
  FOR ALL USING (
    -- Allow users to access their own records
    auth.uid() = id 
    OR 
    -- Allow service_role to perform operations (for user registration)
    auth.jwt() ->> 'role' = 'service_role'
  ) 
  WITH CHECK (
    -- Allow users to modify their own records
    auth.uid() = id 
    OR 
    -- Allow service_role to create/modify records (for user registration)
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Update verhuurders table policy for consistency
DROP POLICY IF EXISTS "Eigen verhuurder" ON public.verhuurders;

CREATE POLICY "Eigen verhuurder" ON public.verhuurders
  FOR ALL USING (
    -- Allow users to access their own records
    auth.uid() = id 
    OR 
    -- Allow service_role to perform operations (for user registration)
    auth.jwt() ->> 'role' = 'service_role'
  ) 
  WITH CHECK (
    -- Allow users to modify their own records
    auth.uid() = id 
    OR 
    -- Allow service_role to create/modify records (for user registration)
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Update beoordelaars table policy for consistency
DROP POLICY IF EXISTS "Eigen beoordelaar" ON public.beoordelaars;

CREATE POLICY "Eigen beoordelaar" ON public.beoordelaars
  FOR ALL USING (
    -- Allow users to access their own records
    auth.uid() = id 
    OR 
    -- Allow service_role to perform operations (for user registration)
    auth.jwt() ->> 'role' = 'service_role'
  ) 
  WITH CHECK (
    -- Allow users to modify their own records
    auth.uid() = id 
    OR 
    -- Allow service_role to create/modify records (for user registration)
    auth.jwt() ->> 'role' = 'service_role'
  );