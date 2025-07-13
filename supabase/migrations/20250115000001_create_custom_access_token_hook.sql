-- Create custom access token hook function
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  user_roles text[];
  primary_role text;
  subscription_status text;
BEGIN
  -- Get user roles from gebruiker_rollen table
  SELECT 
    array_agg(role),
    (array_agg(role))[1], -- Primary role (first one)
    (array_agg(gr.subscription_status))[1] -- Primary subscription status
  INTO 
    user_roles,
    primary_role,
    subscription_status
  FROM public.gebruiker_rollen gr
  WHERE gr.user_id = (event->>'user_id')::uuid;

  -- If no roles found, assign default 'Huurder' role
  IF user_roles IS NULL OR array_length(user_roles, 1) IS NULL THEN
    user_roles := ARRAY['Huurder'];
    primary_role := 'Huurder';
    subscription_status := NULL;
  END IF;

  -- Add custom claims to the JWT
  event := jsonb_set(
    event,
    '{claims,app_metadata}',
    jsonb_build_object(
      'roles', user_roles,
      'primary_role', primary_role,
      'subscription_status', subscription_status
    )
  );

  -- Also add primary role to user_metadata for easier access
  event := jsonb_set(
    event,
    '{claims,user_metadata,role}',
    to_jsonb(primary_role)
  );

  RETURN event;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;

-- Revoke function permissions from other roles for security
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;

-- Add comment for documentation
COMMENT ON FUNCTION public.custom_access_token_hook IS 'Custom access token hook that adds user roles and subscription status to JWT claims';