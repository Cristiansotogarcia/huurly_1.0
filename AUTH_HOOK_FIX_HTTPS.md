# Fix Auth Hook - Use HTTPS Instead of Postgres Function

## The Problem

The auth hook is configured as a **Postgres function** (`pg-functions://postgres/public/send_email_hook`), but this requires database settings that aren't configured. This causes the 500 error during signup.

## The Solution

Configure the hook as an **HTTPS hook** to call the Edge Function directly. This is the recommended approach according to Supabase documentation.

## Step-by-Step Fix

### 1. Remove the Current Hook Configuration

Go to: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/auth/hooks

- Find the "Send Email" hook (currently showing as enabled with Postgres function)
- **Delete** it (or disable it temporarily)

### 2. Generate a Webhook Secret

The hook needs a secret for security. You'll generate this in the next step when creating the hook.

### 3. Create New HTTPS Hook

In the same Auth Hooks page:

1. Click **"Create a new hook"** or **"Add hook"**
2. Select **"Send Email"** as the hook type
3. Choose **"HTTPS"** (NOT "Postgres")
4. Enter the URL: `https://sqhultitvpivlnlgogen.supabase.co/functions/v1/send-email-hook`
5. Click **"Generate Secret"** to create a webhook secret
6. **IMPORTANT**: Copy this secret - it looks like: `v1,whsec_<base64_secret>`
7. Click **"Create hook"** or **"Save"**

### 4. Configure the Edge Function Secret

The Edge Function needs the webhook secret to verify requests.

#### Option A: Via Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/functions/send-email-hook/details
2. Click **"Edge Function Settings"** or **"Secrets"**
3. Add a new secret:
   - Name: `SEND_EMAIL_HOOK_SECRET`
   - Value: `v1,whsec_<base64_secret>` (the full secret from step 3)
4. Save the secret

#### Option B: Via Supabase CLI
```bash
# In your terminal, set the secret
supabase secrets set SEND_EMAIL_HOOK_SECRET="v1,whsec_<base64_secret>"
```

**Note**: Replace `<base64_secret>` with the actual secret generated in step 3.

### 5. Verify the Edge Function Code

Your `send-email-hook` function should already be deployed and has the correct webhook verification code. It's located at `supabase/functions/send-email-hook/index.ts`.

The key part is the webhook verification:
```typescript
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') ?? '';
const wh = new Webhook(hookSecret);
const payload: AuthHookPayload = wh.verify(payloadText, headers);
```

### 6. Test the Setup

1. Try signing up a new user at: https://huurly.nl
2. Check that the signup works without a 500 error
3. Verify the user receives a custom branded email

### 7. Monitor for Issues

If there are any problems:
- Check Edge Function logs: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/functions/send-email-hook/logs
- Check Auth logs: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/logs/auth-logs

## Why HTTPS Instead of Postgres?

According to Supabase documentation, HTTPS hooks are:
- ✅ Simpler to configure (no database settings needed)
- ✅ More secure (uses Standard Webhooks specification)
- ✅ Easier to debug (check Edge Function logs)
- ✅ More flexible (can call external services easily)

The Postgres function approach requires:
- ❌ Storing service role key in database settings
- ❌ Configuring the `http` extension
- ❌ Complex grant permissions
- ❌ Additional security considerations

## What Happens After Fix

✅ Signups will work normally
✅ Users receive custom branded emails
✅ All auth flows continue to work
✅ No more 500 errors

## Files Reference

- `supabase/functions/send-email-hook/index.ts` - The Edge Function (already deployed)
- `supabase/migrations/20250204000000_create_auth_hook_wrapper.sql` - Can be removed or ignored (not needed for HTTPS approach)

## Additional Configuration

Make sure these secrets are set in your Edge Function:
1. `SEND_EMAIL_HOOK_SECRET` - Webhook secret for verification (created above)
2. `RESEND_API_KEY` - Your Resend API key for sending emails
3. `RESEND_FROM_EMAIL` - Your from email address (e.g., `team@huurly.nl`)

You can verify these are set in: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/functions/send-email-hook/details
