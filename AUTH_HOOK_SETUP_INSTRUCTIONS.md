# Auth Hook Configuration - Step by Step

## Current Status
✅ Edge Function `send-email-hook` is deployed
❌ Hook not yet configured in Supabase Dashboard

## Configuration Steps

### In the "Add Send Email hook" screen you're currently viewing:

1. **Enable Send Email hook**: ✅ Already enabled (keep it on)

2. **Hook type**: 
   - **Keep "Postgres"** selected (this is correct for Edge Functions)
   - Don't change to HTTPS

3. **Postgres Schema**: Should show `public` (leave as default)

4. **Postgres function**: 
   - Click the dropdown menu
   - Look for and select **`send-email-hook`** from the list
   - This is your deployed Edge Function

5. **The statements section**: Will auto-populate after selecting the function

6. **Click "Create hook"**

### Alternative: If function doesn't appear in dropdown

If you don't see `send-email-hook` in the Postgres function dropdown:

Try the direct invocation method:
1. Leave Postgres selected
2. In the function dropdown, you may need to manually type: `send-email-hook`
3. Or check if Edge Functions appear under a different section

### Another Alternative: Via SQL

If the UI doesn't work, you can create the hook via SQL:

1. Go to SQL Editor in Supabase Dashboard
2. Run this query:

```sql
-- Create auth hook for sending emails
create or replace function public.send_email_hook()
returns trigger
language plpgsql
security definer
as $$
begin
  -- This will invoke the Edge Function
  perform net.http_post(
    url := 'https://sqhultitvpivlnlgogen.supabase.co/functions/v1/send-email-hook',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'email_action_type', TG_ARGV[0],
      'user', row_to_json(NEW),
      'email_data', jsonb_build_object(
        'token_hash', NEW.confirmation_token,
        'redirect_to', current_setting('app.settings.site_url', true) || '/auth/confirm',
        'site_url', current_setting('app.settings.site_url', true)
      )
    )
  );
  return NEW;
end;
$$;
```

Note: You'll need to configure your service role key as a setting first.

## Finding Your Service Role Key

If you don't have your service role key handy:

1. Go to: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/settings/api
2. Look for **"Service Role Key"** section
3. Click to reveal/copy the key
4. Use it in the Authorization header above

⚠️ **Important**: Keep this key secret! It has full admin access to your database.

## Verification

After creating the hook:

1. The hook should appear in the hooks list
2. You should see it marked as "enabled"
3. When a user signs up, check the Edge Function logs to see if it's being triggered:
   https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/functions/send-email-hook/logs

## If You Have Issues

### Hook not triggering?
- Verify HTTPS is selected (not Postgres)
- Check the URL is correct
- Verify Authorization header has the correct service role key
- Check Edge Function logs for errors

### Still getting two emails?
- Make sure the hook is **enabled**
- Verify the hook was created successfully
- Check there are no other hooks enabled for send-email

### No emails at all?
- Check Edge Function logs for errors
- Verify RESEND_API_KEY is set in Edge Function secrets
- Make sure email confirmation is enabled in auth settings

## Summary

The key fix is: **Use HTTPS hook type, not Postgres**

Your Edge Function is ready and waiting - it just needs to be called via HTTPS!
