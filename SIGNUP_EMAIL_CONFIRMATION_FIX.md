# Signup Email Confirmation Fix

## Problem
After configuring the auth hook, signup emails were sent but clicking "Doorgaan" resulted in an error:
```
{"message":"No API key found in request","hint":"No `apikey` request header or url param was found."}
```

## Root Cause
The confirmation URL in the email was pointing directly to the app (`/auth/confirm?token_hash=...&type=signup`) instead of going through Supabase's auth verification endpoint first.

## Solution
Changed the confirmation URL format in the Edge Function from:
```typescript
// ❌ WRONG - Direct to app (missing API key)
const confirmationUrl = `${payload.email_data.site_url}/auth/confirm?token_hash=${payload.email_data.token_hash}&type=${payload.email_action_type}`;
```

To:
```typescript
// ✅ CORRECT - Through Supabase auth endpoint
const confirmationUrl = `${payload.email_data.site_url}/auth/v1/verify?token=${payload.email_data.token_hash}&type=${payload.email_action_type}&redirect_to=${payload.email_data.redirect_to}`;
```

## How It Works Now

### Email Confirmation Flow
1. User signs up at https://huurly.nl
2. Auth hook triggers and sends custom branded email via Resend
3. User clicks "Bevestig je E-mail Adres" button in email
4. Link goes to: `https://sqhultitvpivlnlgogen.supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=https://www.huurly.nl/auth/confirm`
5. Supabase verifies the token and creates a session
6. Supabase redirects to: `https://www.huurly.nl/auth/confirm` (with session cookies)
7. Your app's AuthConfirm page handles the redirect and shows success message
8. User is redirected to homepage with verified account

## What Changed

### Files Modified
1. **supabase/functions/send-email-hook/index.ts**
   - Fixed confirmation URL format for all email types (signup, recovery, magic_link, etc.)
   - URL now goes through Supabase's `/auth/v1/verify` endpoint

### Files Deployed
- Edge Function redeployed with the fix

## Testing Steps

1. **Test Signup Flow**
   ```
   - Go to https://huurly.nl
   - Click "Registreren" 
   - Fill in signup form
   - Check your email
   - Click "Bevestig je E-mail Adres"
   - Should redirect to app with success message
   - Should be able to login
   ```

2. **Test Password Reset** (optional)
   ```
   - Go to https://huurly.nl
   - Click "Wachtwoord vergeten?"
   - Enter email
   - Check your email
   - Click "Stel Nieuw Wachtwoord In"
   - Should redirect to password reset page
   ```

## Expected Behavior

### ✅ Success Indicators
- Email arrives with Huurly branding
- Clicking confirmation button redirects to Supabase auth endpoint
- User is redirected back to app with active session
- Success message is displayed
- User can login immediately

### ❌ If It Still Fails
Check the following:
1. **Browser Console**: Look for any errors
2. **Edge Function Logs**: Check Supabase dashboard for function logs
3. **Network Tab**: Inspect the `/auth/v1/verify` request/response
4. **Redirect URL**: Ensure it's configured correctly in Supabase dashboard

## Configuration Checklist

Make sure these are configured in Supabase Dashboard:

### Auth Settings
- ✅ Site URL: `https://www.huurly.nl`
- ✅ Redirect URLs:
  - `https://www.huurly.nl/**`
  - `https://www.huurly.nl/auth/confirm`

### Auth Hook
- ✅ Hook Type: **HTTPS** (not Postgres)
- ✅ Hook URL: `https://sqhultitvpivlnlgogen.supabase.co/functions/v1/send-email-hook`
- ✅ Secret: Configured as `SEND_EMAIL_HOOK_SECRET` in Edge Function

### Edge Function Secrets
- ✅ `SEND_EMAIL_HOOK_SECRET`: Your webhook secret from auth hook
- ✅ `RESEND_API_KEY`: Your Resend API key
- ✅ `RESEND_FROM_EMAIL`: team@huurly.nl

## Additional Notes

- The `/auth/v1/verify` endpoint automatically includes the API key
- It verifies the token server-side and creates a session
- It then redirects back to your app with session cookies
- Your `AuthConfirm.tsx` page doesn't need to call `verifyOtp()` anymore (though it won't hurt if it does - the session is already created)

## Troubleshooting

### If Emails Don't Arrive
1. Check Edge Function logs for errors
2. Verify Resend API key is correct
3. Check Resend dashboard for delivery status

### If Confirmation Link Gives API Key Error
1. Verify the URL format includes `/auth/v1/verify`
2. Check the `redirect_to` parameter is correct
3. Ensure Site URL is configured in Supabase

### If Session Isn't Created
1. Check browser cookies are enabled
2. Verify redirect URLs in Supabase dashboard
3. Check for CORS errors in browser console

## Success!
Your signup flow should now work completely:
- Users receive branded Huurly emails ✉️
- Confirmation links work without errors ✅
- Users can complete signup and login 🎉
