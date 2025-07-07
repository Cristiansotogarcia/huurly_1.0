-- First, let's check if the user exists in huurders table and create if missing
-- This will handle the current user and prevent future issues

-- Create a function to ensure huurder profile exists
CREATE OR REPLACE FUNCTION public.ensure_huurder_profile(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Get user info from gebruikers table
  SELECT * INTO user_record FROM public.gebruikers WHERE id = user_uuid;
  
  -- If user doesn't exist in gebruikers, skip
  IF user_record IS NULL THEN
    RETURN;
  END IF;
  
  -- If user role is huurder and doesn't exist in huurders table, create record
  IF user_record.rol = 'huurder' AND NOT EXISTS (SELECT 1 FROM public.huurders WHERE id = user_uuid) THEN
    INSERT INTO public.huurders (id) VALUES (user_uuid);
  END IF;
END;
$$;

-- Create trigger to automatically create huurder profile when gebruiker is inserted with huurder role
CREATE OR REPLACE FUNCTION public.auto_create_huurder_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.rol = 'huurder' THEN
    INSERT INTO public.huurders (id) VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS auto_create_huurder_profile_trigger ON public.gebruikers;
CREATE TRIGGER auto_create_huurder_profile_trigger
  AFTER INSERT ON public.gebruikers
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_huurder_profile();

-- Fix the current user by creating their huurder profile
-- We'll use the authenticated user ID from the logs
SELECT public.ensure_huurder_profile('291b54fe-b9ad-41c4-a11f-b47b2bfad2a8'::uuid);