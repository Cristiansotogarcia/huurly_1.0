-- Create a Postgres function that wraps our Edge Function
-- This allows Auth Hooks to call our Edge Function

-- First, ensure the http extension is enabled
create extension if not exists http with schema extensions;

-- Create the wrapper function
create or replace function public.send_email_hook(
  event jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  request_id bigint;
  service_role_key text;
begin
  -- Get the service role key from vault (or use environment variable)
  -- Note: In production, store this securely in Supabase Vault
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- If not set, use the SUPABASE_SERVICE_ROLE_KEY env var
  if service_role_key is null then
    service_role_key := current_setting('SUPABASE_SERVICE_ROLE_KEY', true);
  end if;

  -- Call the Edge Function via HTTP
  select http_post(
    'https://sqhultitvpivlnlgogen.supabase.co/functions/v1/send-email-hook',
    event::text,
    'application/json',
    jsonb_build_object(
      'Authorization', 'Bearer ' || service_role_key,
      'Content-Type', 'application/json'
    )::jsonb
  ) into request_id;

  -- Log the request (optional)
  raise log 'Auth hook triggered with request_id: %', request_id;
end;
$$;

-- Grant execute permission
grant execute on function public.send_email_hook(jsonb) to postgres, anon, authenticated, service_role;

-- Add comment
comment on function public.send_email_hook is 'Wrapper function to call send-email-hook Edge Function for auth hooks';
