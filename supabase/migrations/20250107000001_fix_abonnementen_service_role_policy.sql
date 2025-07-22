-- Fix RLS policy for abonnementen table to allow service_role operations
-- This fixes the Stripe webhook error where service_role cannot insert into abonnementen table

-- Drop existing policies
DROP POLICY IF EXISTS "abonnementen_select_policy" ON public.abonnementen;
DROP POLICY IF EXISTS "abonnementen_insert_policy" ON public.abonnementen;
DROP POLICY IF EXISTS "abonnementen_update_policy" ON public.abonnementen;
DROP POLICY IF EXISTS "abonnementen_delete_policy" ON public.abonnementen;
DROP POLICY IF EXISTS "Users can insert their own payment records" ON public.abonnementen;
DROP POLICY IF EXISTS "Allow payment record updates" ON public.abonnementen;

-- Create new policies that allow service_role operations (for Stripe webhook)
CREATE POLICY "abonnementen_select_policy" ON public.abonnementen
  FOR SELECT USING (
    -- Allow users to access their own records
    auth.uid() = huurder_id 
    OR 
    -- Allow service_role to perform operations (for webhook)
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "abonnementen_insert_policy" ON public.abonnementen
  FOR INSERT WITH CHECK (
    -- Allow users to create their own records
    auth.uid() = huurder_id 
    OR 
    -- Allow service_role to create records (for webhook)
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "abonnementen_update_policy" ON public.abonnementen
  FOR UPDATE USING (
    -- Allow users to update their own records
    auth.uid() = huurder_id 
    OR 
    -- Allow service_role to update records (for webhook)
    auth.jwt() ->> 'role' = 'service_role'
  ) WITH CHECK (
    -- Allow users to update their own records
    auth.uid() = huurder_id 
    OR 
    -- Allow service_role to update records (for webhook)
    auth.jwt() ->> 'role' = 'service_role'
  );

CREATE POLICY "abonnementen_delete_policy" ON public.abonnementen
  FOR DELETE USING (
    -- Allow users to delete their own records
    auth.uid() = huurder_id 
    OR 
    -- Allow service_role to delete records (for webhook)
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Ensure proper permissions are granted
GRANT SELECT, INSERT, UPDATE, DELETE ON public.abonnementen TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.abonnementen TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Add comment for documentation
COMMENT ON TABLE public.abonnementen IS 'Subscription table with RLS policies that allow both user access and service_role operations for Stripe webhooks';