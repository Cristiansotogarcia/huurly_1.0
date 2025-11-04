-- Disable Auth Hook to Fix Signup Error
-- This script disables the send_email_hook that's causing 500 errors
-- After running this, signups will use Supabase's default email system

-- Drop the auth hook if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the wrapper function
DROP FUNCTION IF EXISTS public.send_email_hook(jsonb);

-- Verify hooks are removed
SELECT 
  trigger_name, 
  event_object_table, 
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Auth hook has been disabled. Signups should now work normally.';
  RAISE NOTICE 'Users will receive Supabase default confirmation emails.';
  RAISE NOTICE 'To re-enable custom emails, follow AUTH_HOOK_SETUP_INSTRUCTIONS.md';
END $$;
