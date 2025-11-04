# Auth Hook Setup Guide - Email Duplication Fix

## What Was Implemented

We've created a Supabase Auth Hook that handles ALL authentication emails (signup, password reset, etc.) with your custom branded templates. This eliminates duplicate emails and ensures role-specific content.

## Files Changed

1. ✅ **`supabase/functions/send-email-hook/index.ts`** - Created (DEPLOYED)
   - Handles all auth emails with custom branding
   - Supports role-specific content (huurder vs verhuurder)
   - Includes templates for: signup, password recovery, magic links, email changes, invites

2. ✅ **`supabase/functions/register-user/index.ts`** - Modified (DEPLOYED)
   - Removed duplicate email sending code
   - Now relies on auth hook for email delivery

## Configuration Steps - YOU MUST DO THIS

### Step 1: Enable Email Confirmation in Supabase

1. Go to: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/auth/providers
2. Click on **Email** provider
3. Find **"Confirm email"** setting
4. **Enable it** with this text:
   ```
   Users will need to confirm their email address before signing in for the first time
   ```
5. **Save changes**

### Step 2: Configure the Auth Hook

1. Go to: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/auth/hooks
2. Click on **"Send Email"** hook (or Add Hook → Send Email)
3. Configure:
   - **Hook Name**: `send-email-hook`
   - **Function**: Select `send-email-hook` from dropdown
   - **Enabled**: ✅ Check this box
   - **Event types**: Select ALL (signup, recovery, invite, magic_link, email_change_current, email_change_new, reauthentication)
4. Click **Save**

### Step 3: Remove Supabase's Default Email Templates (Optional)

Since the hook handles emails, you can optionally:
1. Go to: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/auth/templates
2. For each template, you can leave them as default (they won't be used when hook is active)
3. Or add a simple message like: "This template is managed by custom auth hook"

## How It Works Now

### Signup Flow
1. User signs up → Profile created in database
2. Supabase detects signup → Triggers `send-email-hook`
3. Hook receives user data (including role from user_metadata)
4. Hook generates role-specific welcome email
5. Hook sends via Resend with your branding
6. User receives ONE branded email with working confirmation link

### Password Recovery Flow
1. User requests password reset
2. Supabase triggers `send-email-hook` with action_type: 'recovery'
3. Hook sends branded password reset email
4. User clicks link → Can set new password

### All Email Types Handled
- ✅ Signup confirmation (role-specific)
- ✅ Password recovery
- ✅ Magic link login
- ✅ Email change confirmation
- ✅ User invitations
- ✅ Reauthentication

## Testing Checklist

After configuring the hook, test:

- [ ] **Sign up** - Should receive ONE email with your branding and role-specific content
- [ ] **Email confirmation link** - Should work correctly
- [ ] **Login after confirmation** - Should redirect to payment/dashboard
- [ ] **Password reset** - Should receive branded reset email
- [ ] **Email works** - Check confirmation link works and styling looks good

## Troubleshooting

### If You Get Two Emails
- Check that auth hook is **Enabled** in dashboard
- Verify hook is selected for **all event types**
- Check function logs for errors

### If Email Link is Broken
- Verify `SITE_URL` environment variable in Edge Function settings
- Should be set to: `https://huurly.nl` (production) or your dev URL

### If No Email is Sent
1. Check Edge Function logs: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/functions/send-email-hook/logs
2. Verify `RESEND_API_KEY` is set in Edge Function secrets
3. Verify `RESEND_FROM_EMAIL` is set (defaults to team@huurly.nl)

### Checking Environment Variables
1. Go to: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/functions/send-email-hook
2. Click **Settings** tab
3. Verify these secrets are set:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (optional, defaults to team@huurly.nl)
   - `SITE_URL` (optional, defaults to https://huurly.nl)

## Benefits of This Solution

✅ **No Duplicate Emails** - Only ONE email sent per auth action
✅ **Consistent Branding** - All emails use your purple gradient design
✅ **Role-Specific Content** - Huurders and verhuurders see relevant steps
✅ **Reliable Links** - Uses Supabase's official confirmation URLs
✅ **Full Control** - Handle ALL auth emails with custom logic
✅ **Easy Maintenance** - One function to manage all email templates
✅ **Professional** - Password resets, magic links, etc. all branded

## Email Examples

### Signup Email (Huurder)
- Subject: "Welkom bij Huurly, [FirstName]! 🏠"
- Content: Role-specific welcome with steps for huurders
- Button: "Bevestig je E-mail Adres"

### Signup Email (Verhuurder)
- Subject: "Welkom bij Huurly, [FirstName]! 🏠"
- Content: Role-specific welcome with steps for verhuurders
- Button: "Bevestig je E-mail Adres"

### Password Recovery
- Subject: "Wachtwoord herstellen - Huurly"
- Content: Reset instructions with security warning
- Button: "Stel Nieuw Wachtwoord In"

## Support

If you encounter issues:
1. Check Edge Function logs in Supabase dashboard
2. Verify all configuration steps above
3. Test with a real email address
4. Check spam folder

## Next Steps

1. ✅ Functions deployed
2. ⏳ **YOU: Enable email confirmation in Supabase**
3. ⏳ **YOU: Configure auth hook in dashboard**
4. ⏳ **Test signup flow**
5. ⏳ **Verify email works and looks good**
6. 🎉 Done!
