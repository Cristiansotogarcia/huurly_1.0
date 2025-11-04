# Signup Email URL Fix - Final Resolution

## Problem Identified
The confirmation URL in signup emails had two critical bugs:

### Bug 1: `type=undefined`
```
https://sqhultitvpivlnlgogen.supabase.co/auth/v1/auth/v1/verify?token=...&type=undefined&redirect_to=https://huurly.nl
```

**Root Cause**: Using `payload.email_action_type` (doesn't exist) instead of `payload.email_data.email_action_type`

### Bug 2: Double `/auth/v1` path
The URL had `/auth/v1/auth/v1/verify` instead of just `/auth/v1/verify`

**Root Cause**: `payload.email_data.site_url` includes `/auth/v1` suffix, so concatenating it with `/auth/v1/verify` creates a duplicate path

## The Fix

### What Was Changed
Updated all references from `payload.email_action_type` to `payload.email_data.email_action_type` in:

1. **Logging statements** - For better debugging
2. **URL construction** - The critical fix
3. **Switch statement** - Email template selection
4. **Additional logging** - Added URL logging to verify construction

### Code Changes

#### Before (❌ WRONG)
```typescript
// Wrong - email_action_type doesn't exist at root level
const confirmationUrl = `${payload.email_data.site_url}/auth/v1/verify?token=${payload.email_data.token_hash}&type=${payload.email_action_type}&redirect_to=${payload.email_data.redirect_to}`;

switch (payload.email_action_type) {
  case 'signup':
    // ...
}
```

#### After (✅ CORRECT)
```typescript
// Correct - email_action_type is nested in email_data
// Also remove /auth/v1 suffix from site_url to avoid duplication
let baseUrl = payload.email_data.site_url;

// Remove /auth/v1 suffix if it exists to avoid duplication
if (baseUrl.endsWith('/auth/v1')) {
  baseUrl = baseUrl.slice(0, -8); // Remove '/auth/v1'
}

const confirmationUrl = `${baseUrl}/auth/v1/verify?token=${payload.email_data.token_hash}&type=${payload.email_data.email_action_type}&redirect_to=${payload.email_data.redirect_to}`;

console.log('Base URL:', baseUrl);
console.log('Confirmation URL constructed:', confirmationUrl);

switch (payload.email_data.email_action_type) {
  case 'signup':
    // ...
}
```

## How It Works Now

### Email Confirmation Flow
1. User signs up at https://huurly.nl
2. Auth hook triggers with correct payload structure
3. Edge Function constructs proper URL with `email_data.email_action_type`
4. User receives email with correct link format:
   ```
   https://sqhultitvpivlnlgogen.supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=https://www.huurly.nl/auth/confirm
   ```
5. User clicks link → Supabase verifies token → Creates session → Redirects to app
6. Success message displayed and user can login

## What Changed

### Files Modified
1. **supabase/functions/send-email-hook/index.ts**
   - ✅ Fixed all `payload.email_action_type` → `payload.email_data.email_action_type`
   - ✅ Added logic to strip `/auth/v1` suffix from `site_url` if present
   - ✅ Added debug logging for base URL and final confirmation URL
   - ✅ Added logging for site_url and redirect_to values

### Deployed
- ✅ Edge Function redeployed to Supabase
- ✅ Available at: https://sqhultitvpivlnlgogen.supabase.co/functions/v1/send-email-hook

## Testing Instructions

### 1. Test Signup Flow
```
Steps:
1. Clear your browser cookies/cache
2. Go to https://huurly.nl
3. Click "Registreren"
4. Fill in all required fields:
   - First name
   - Last name
   - Email
   - Password (8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special)
   - Role selection
5. Submit the form
6. Check your email inbox
7. Click "Bevestig je E-mail Adres" button
8. Should redirect to app with success message
9. Should be able to login

Expected Result:
✅ Email arrives with Huurly branding
✅ Clicking button redirects smoothly (no errors)
✅ URL format is correct (no /auth/v1/auth/v1, no type=undefined)
✅ Success page shows up
✅ Can login immediately
```

### 2. Check Edge Function Logs (If Issues)
```
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on "send-email-hook"
4. View logs tab
5. Look for:
   - "Auth hook triggered" with correct actionType
   - "Confirmation URL constructed" with proper URL
   - "Auth email sent successfully"
```

### 3. Expected Log Output
```json
{
  "actionType": "signup",  // ✅ Should be "signup", NOT undefined
  "email": "user@example.com",
  "userId": "...",
  "siteUrl": "https://sqhultitvpivlnlgogen.supabase.co",
  "redirectTo": "https://www.huurly.nl/auth/confirm"
}

"Confirmation URL constructed: https://sqhultitvpivlnlgogen.supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=..."
```

## Payload Structure Reference

### Correct Structure (from Supabase docs)
```typescript
{
  user: {
    id: string;
    email: string;
    user_metadata: {
      first_name?: string;
      last_name?: string;
      role?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;  // ← THIS is the correct path
    site_url: string;
  };
}
```

## Troubleshooting

### If URL Still Has Issues

1. **Check Edge Function Logs**
   - Look for "Confirmation URL constructed" log
   - Verify the URL format is correct

2. **Verify Auth Hook Configuration**
   - Go to Auth > Hooks in Supabase Dashboard
   - Ensure Hook Type is "HTTPS"
   - URL should be: `https://sqhultitvpivlnlgogen.supabase.co/functions/v1/send-email-hook`
   - Secret should be configured

3. **Check Environment Variables**
   ```bash
   # In Supabase Dashboard > Project Settings > Edge Functions
   SEND_EMAIL_HOOK_SECRET=v1,whsec_...
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=team@huurly.nl
   ```

### If Emails Don't Arrive

1. Check Resend Dashboard for delivery status
2. Verify RESEND_API_KEY is correct
3. Check Edge Function logs for Resend errors

### If Session Not Created

1. Verify Site URL in Auth settings: `https://www.huurly.nl`
2. Check Redirect URLs include: `https://www.huurly.nl/**`
3. Ensure cookies are enabled in browser

## Success Criteria

✅ Confirmation email arrives within seconds
✅ Email has proper Huurly branding
✅ Clicking "Bevestig je E-mail Adres" redirects smoothly
✅ No "No API key found" error
✅ No "type=undefined" in URL
✅ Success message appears after confirmation
✅ User can login immediately
✅ Edge Function logs show correct data

## Related Documentation

- **SIGNUP_EMAIL_CONFIRMATION_FIX.md** - Previous attempt (had bugs)
- **AUTH_HOOK_FIX_HTTPS.md** - Initial auth hook setup
- **SIGNUP_ERROR_FIX.md** - Original 500 error fix
- **SIGNUP_FLOW_FIX_SUMMARY.md** - Overall signup flow documentation

## Summary

The issue was caused by accessing `email_action_type` from the wrong location in the payload structure. By updating all references to use `payload.email_data.email_action_type`, the confirmation URLs now construct correctly with the proper type parameter and no duplicate paths.

**Status**: ✅ FIXED AND DEPLOYED
**Deployment Time**: 2025-11-04 21:19 CET
**Edge Function**: `send-email-hook` version deployed (with double path fix)

## Key Changes Summary

1. **Fixed `type=undefined`**: Changed `payload.email_action_type` → `payload.email_data.email_action_type`
2. **Fixed double `/auth/v1` path**: Added logic to strip `/auth/v1` from `site_url` before constructing URL
3. **Added comprehensive logging**: Now logs base URL and final confirmation URL for debugging

The URL now correctly constructs as:
```
https://sqhultitvpivlnlgogen.supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=...
```

Instead of the broken:
```
https://sqhultitvpivlnlgogen.supabase.co/auth/v1/auth/v1/verify?token=...&type=undefined&redirect_to=...
```
