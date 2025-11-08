# Email Sequence Troubleshooting Guide

You saw the cron job execute but didn't receive BCC emails. Let's diagnose the issue step by step.

## 🔍 Step 1: Check If Emails Were Sent

Run the queries in `check_email_status.sql` in your Supabase SQL Editor:
https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/sql/new

This will show you:
- ✅ If any emails were actually sent
- ✅ If any users qualified for emails
- ✅ What errors occurred (if any)

## 🎯 Most Likely Issues

### Issue 1: No Users Qualified for Emails

**Symptoms:**
- Cron runs successfully
- No entries in `email_sequence_log` table
- No errors in logs

**Reason:**
The system only sends emails to users who meet specific criteria:

**Unverified Sequence:**
- User must be 2+ days old
- Email NOT confirmed
- Haven't received this email before

**Unpaid Sequence:**
- Email IS confirmed
- NO active subscription
- 1+ days since verification

**Incomplete Profile:**
- HAS active subscription
- Profile NOT complete
- 1+ days since payment

**Solution:** Check if you have any users matching these criteria using the SQL queries in `check_email_status.sql`.

---

### Issue 2: RESEND_API_KEY Not Set

**Symptoms:**
- Function logs show: "RESEND_API_KEY not configured"
- Cron job fails

**Solution:**
1. Go to: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/settings/functions
2. Check "Environment Variables" section
3. Verify these are set:
   - `RESEND_API_KEY` - Your Resend API key
   - `RESEND_FROM_EMAIL` - (optional, defaults to team@huurly.nl)
   - `EMAIL_BCC_MONITORING` - (optional, defaults to team@huurly.nl)

If missing, add them:
```bash
supabase secrets set RESEND_API_KEY="your_actual_resend_key"
supabase secrets set RESEND_FROM_EMAIL="team@huurly.nl"
supabase secrets set EMAIL_BCC_MONITORING="team@huurly.nl"
```

---

### Issue 3: Resend Domain Not Verified

**Symptoms:**
- Function logs show errors from Resend API
- Emails fail to send

**Solution:**
1. Log in to Resend: https://resend.com/domains
2. Verify that your domain (huurly.nl) is verified
3. Check DNS records are properly configured

---

### Issue 4: Emails in Spam/Junk Folder

**Symptoms:**
- Emails were sent (confirmed in logs)
- Not in inbox

**Solution:**
- Check your spam/junk folder in team@huurly.nl
- Mark as "Not Spam" if found
- Add team@huurly.nl to safe senders

---

## 🧪 Quick Test: Send Email Manually

To test if email sending works at all, run this in SQL Editor:

```sql
-- Manually trigger the function to see immediate results
SELECT net.http_post(
  url := 'https://sqhultitvpivlnlgogen.supabase.co/functions/v1/check-email-sequences',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer YOUR_ANON_KEY'
  ),
  body := jsonb_build_object('time', now())
);
```

Then immediately check:

```sql
-- Check what happened
SELECT * FROM email_sequence_log ORDER BY sent_at DESC LIMIT 10;
```

---

## 📊 Diagnostic Checklist

Run through this checklist:

### 1. Environment Variables
```bash
# Check secrets are set (run locally)
supabase secrets list --project-ref sqhultitvpivlnlgogen
```

Should show:
- ✅ RESEND_API_KEY
- ✅ RESEND_FROM_EMAIL (or will default)
- ✅ EMAIL_BCC_MONITORING (or will default)

### 2. Check Function Logs
```bash
# View recent function logs
supabase functions logs check-email-sequences --project-ref sqhultitvpivlnlgogen
```

Look for:
- ❌ "RESEND_API_KEY not configured" - Add the key
- ❌ "Failed to send email" - Check Resend dashboard
- ✅ "Sent [type] email #[number] to [email]" - Working!
- ℹ️ "Found 0 unverified users" - No users to email

### 3. Check Users Exist

Run in SQL Editor:
```sql
-- Do you have any unverified users 2+ days old?
SELECT COUNT(*) as unverified_count
FROM auth.users
WHERE email_confirmed_at IS NULL
  AND created_at < NOW() - INTERVAL '2 days';

-- Do you have any verified but unpaid users?
SELECT COUNT(*) FROM get_unpaid_verified_users();

-- Do you have any paid but incomplete users?
SELECT COUNT(*) FROM get_paid_incomplete_users();
```

If all counts are 0, that's why no emails were sent!

### 4. Check Email Preferences

```sql
-- Check if users have unsubscribed
SELECT 
  u.email,
  ep.unsubscribed_from_sequences,
  ep.unsubscribed_at
FROM email_preferences ep
JOIN auth.users u ON ep.user_id = u.id
WHERE ep.unsubscribed_from_sequences = true;
```

---

## 🔧 Common Fixes

### Fix 1: Add RESEND_API_KEY

```bash
supabase secrets set RESEND_API_KEY="re_xxxxxxxxxx" --project-ref sqhultitvpivlnlgogen
```

### Fix 2: Create Test User

To test the system, create a test user that's 2+ days old:

```sql
-- Create test unverified user (backdated)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  NULL, -- Not verified
  '{"first_name": "Test", "role": "huurder"}'::jsonb,
  NOW() - INTERVAL '3 days', -- 3 days ago
  NOW() - INTERVAL '3 days',
  encode(gen_random_bytes(32), 'hex'),
  encode(gen_random_bytes(32), 'hex')
);
```

Then trigger the cron manually and check if email was sent.

### Fix 3: Check Resend Dashboard

Go to: https://resend.com/emails

Look for:
- Recent email sends
- Delivery status
- Any errors

---

## 📧 Expected Flow

When everything works correctly:

1. **Cron triggers at 9 AM UTC**
2. **Function checks all users**
3. **For each qualified user:**
   - Checks if email should be sent (not already sent, not unsubscribed)
   - Generates email content
   - Sends via Resend API with BCC to team@huurly.nl
   - Logs to `email_sequence_log` table
4. **You receive BCC at team@huurly.nl**
5. **User receives email at their address**

---

## 🆘 Still Not Working?

If after all checks emails still aren't sending:

1. **Check function deployment:**
   ```bash
   supabase functions list --project-ref sqhultitvpivlnlgogen
   ```

2. **Redeploy the function:**
   ```bash
   supabase functions deploy check-email-sequences --project-ref sqhultitvpivlnlgogen
   ```

3. **Check Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/logs/edge-functions
   - Select `check-email-sequences` function
   - Review logs for errors

4. **Verify Resend Integration:**
   - Resend dashboard: https://resend.com
   - Check API key is valid
   - Check domain is verified
   - Check sending limits not exceeded

---

## 💡 Quick Diagnostic Command

Run this one-liner to get all relevant info:

```sql
-- Comprehensive diagnostic query
SELECT 
  'Unverified Users (2+ days)' as category,
  COUNT(*) as count
FROM auth.users
WHERE email_confirmed_at IS NULL AND created_at < NOW() - INTERVAL '2 days'

UNION ALL

SELECT 
  'Recent Email Sends',
  COUNT(*)
FROM email_sequence_log
WHERE sent_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT
  'Recent Cron Runs',
  COUNT(*)
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-email-sequences-daily')
  AND start_time > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT
  'Failed Email Sends',
  COUNT(*)
FROM email_sequence_log
WHERE status = 'failed' AND sent_at > NOW() - INTERVAL '24 hours';
```

This will show you at a glance if:
- Users exist to email
- Emails were sent
- Cron ran
- Any failures occurred

---

## 📞 Next Steps

1. Run `check_email_status.sql` queries
2. Check the diagnostic results
3. Follow the appropriate fix above
4. Test again manually
5. Monitor tomorrow's 9 AM cron run

If you discover the issue, let me know and I can help fix it!
