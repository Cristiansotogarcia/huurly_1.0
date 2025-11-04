# Signup Error Fix - 500 Internal Server Error

## Problem Identified

The signup is failing with a 500 Internal Server Error because:

1. **Auth hook is configured** in Supabase Dashboard to call the Postgres function `public.send_email_hook()`
2. **The function fails** because it tries to retrieve the `SUPABASE_SERVICE_ROLE_KEY` from database settings, which hasn't been configured
3. **This blocks all signups** since the hook is called during user registration

### Error Details
```
POST https://sqhultitvpivlnlgogen.supabase.co/auth/v1/signup 500 (Internal Server Error)
Error running hook URI: pg-functions://postgres/public/send_email_hook
```

## Immediate Solution

**Disable the auth hook** to allow signups to work normally. Users will receive Supabase's default confirmation emails instead of custom branded emails.

### Steps to Fix:

#### Option 1: Via Supabase Dashboard (Recommended)
1. Go to: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/auth/hooks
2. Find the "Send Email" hook
3. Click the toggle to **disable it**
4. Confirm the change

#### Option 2: Via SQL Editor
1. Go to: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/sql/new
2. Copy and paste the contents of `scripts/disable-auth-hook.sql`
3. Click "Run" to execute the script

### The script will:
- Remove the auth trigger
- Drop the wrapper function
- Verify hooks are removed
- Display success message

## After Running the Fix

1. **Test signup immediately** - it should work with default Supabase emails
2. Users will receive confirmation emails from Supabase (not your custom branded emails)
3. All other functionality remains unchanged

## Long-term Solution (Optional)

If you want custom branded emails later, you'll need to:

### Option A: Configure Service Role Key in Database
1. Store your service role key securely in database settings
2. Update the `send_email_hook` function to access it properly
3. Re-enable the hook

### Option B: Use Direct Edge Function Hook
1. Configure the auth hook to call the Edge Function directly via HTTPS
2. This bypasses the Postgres wrapper entirely
3. Follow the updated instructions in `AUTH_HOOK_SETUP_INSTRUCTIONS.md`

## Current Status After Fix

✅ Signups will work normally
✅ Users receive confirmation emails (Supabase default)
✅ All other auth flows continue to work
❌ Custom branded emails are disabled (for now)

## Files Reference

- `scripts/disable-auth-hook.sql` - SQL script to disable the hook
- `AUTH_HOOK_SETUP_INSTRUCTIONS.md` - Instructions for re-enabling custom emails
- `supabase/functions/send-email-hook/index.ts` - The Edge Function (still deployed but not called)

## Support

If you need further assistance:
- Check Supabase auth logs: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/logs/auth-logs
- Check Edge Function logs: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/functions/send-email-hook/logs
