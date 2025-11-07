# Native Supabase Cron Job Setup

Great news! Supabase DOES support native cron jobs using `pg_cron` and `pg_net` extensions. This is much better than using an external service!

## 🎯 Quick Setup (3 Steps)

### Step 1: Get Your Anon Key

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/settings/api
2. Copy your **anon/public** key

### Step 2: Update the Migration File

Open `supabase/migrations/20250107000001_setup_email_cron_job.sql` and replace `YOUR_ANON_KEY_HERE` with your actual anon key:

```sql
-- Find this line (around line 18):
SELECT vault.create_secret(
  'YOUR_ANON_KEY_HERE',  -- <-- Replace this with your actual key
  'anon_key',
  'Supabase anon key for authentication'
);
```

Change it to (with your actual key):
```sql
SELECT vault.create_secret(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  -- Your actual anon key
  'anon_key',
  'Supabase anon key for authentication'
);
```

### Step 3: Deploy the Migration

```bash
supabase db push
```

That's it! ✅

## ✅ Verify It's Working

After deployment, you can verify the cron job is scheduled:

```sql
-- View all scheduled cron jobs
SELECT * FROM cron.job;

-- You should see:
-- jobname: check-email-sequences-daily
-- schedule: 0 9 * * *
-- active: true
```

## 🔄 Managing the Cron Job

### Change the Schedule

If you want to change when emails are sent:

```sql
-- Change to run every 6 hours
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'check-email-sequences-daily'),
  schedule := '0 */6 * * *'
);

-- Change to weekdays only at 9 AM
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'check-email-sequences-daily'),
  schedule := '0 9 * * 1-5'
);
```

Common schedules:
- `0 9 * * *` - Daily at 9 AM UTC
- `0 */6 * * *` - Every 6 hours
- `0 9 * * 1-5` - Weekdays only at 9 AM
- `*/30 * * * *` - Every 30 minutes

### View Cron Job History

```sql
-- See execution history
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-email-sequences-daily')
ORDER BY start_time DESC
LIMIT 10;
```

### Temporarily Disable the Cron Job

```sql
-- Disable without deleting
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'check-email-sequences-daily'),
  active := false
);

-- Re-enable
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'check-email-sequences-daily'),
  active := true
);
```

### Delete the Cron Job

```sql
-- Permanently remove the cron job
SELECT cron.unschedule('check-email-sequences-daily');
```

## 🧪 Test the Function Manually

Before waiting for the scheduled time, test it manually:

```bash
# Invoke the Edge Function directly
supabase functions invoke check-email-sequences --project-ref sqhultitvpivlnlgogen
```

Or using SQL (simulates the cron job):

```sql
SELECT net.http_post(
  url := 'https://sqhultitvpivlnlgogen.supabase.co/functions/v1/check-email-sequences',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer YOUR_ANON_KEY'
  ),
  body := jsonb_build_object('time', now())
) AS request_id;
```

## 📊 Monitoring

### Check Sent Emails

```sql
SELECT 
  u.email,
  e.sequence_type,
  e.email_number,
  e.sent_at,
  e.status
FROM email_sequence_log e
JOIN auth.users u ON e.user_id = u.id
ORDER BY e.sent_at DESC
LIMIT 20;
```

### Check Cron Job Status

```sql
-- View the cron job
SELECT 
  jobname, 
  schedule, 
  active, 
  command 
FROM cron.job 
WHERE jobname = 'check-email-sequences-daily';

-- View recent runs
SELECT 
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-email-sequences-daily')
ORDER BY start_time DESC
LIMIT 10;
```

## 🔐 Security Notes

- ✅ Your anon key is stored securely in Supabase Vault (encrypted)
- ✅ Only accessible by pg_cron extension
- ✅ Never exposed in logs or client-side code
- ✅ Project URL is also stored in Vault for security

## 🚨 Troubleshooting

### Cron Job Not Running

1. **Check if it's active:**
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'check-email-sequences-daily';
   ```
   Make sure `active = true`

2. **Check execution history:**
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-email-sequences-daily')
   ORDER BY start_time DESC;
   ```

3. **Check extensions are enabled:**
   ```sql
   SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'pg_net');
   ```

### Function Not Being Called

1. **Verify Vault secrets:**
   ```sql
   SELECT name FROM vault.decrypted_secrets WHERE name IN ('project_url', 'anon_key');
   ```

2. **Test the function manually** (see Testing section above)

### Emails Not Sending

Check the main troubleshooting guide in `EMAIL_SEQUENCE_SYSTEM.md`.

## ✨ Advantages Over External Cron

✅ **Native Integration** - No external services needed
✅ **Secure** - Credentials stored in Supabase Vault  
✅ **Reliable** - Managed by Supabase infrastructure
✅ **Easy Management** - Change schedule with SQL
✅ **Execution History** - Built-in logging
✅ **No Extra Cost** - Included with Supabase

---

## 📄 Summary

Your email sequence system now uses **native Supabase cron** scheduling:

1. ✅ pg_cron extension enabled
2. ✅ Credentials stored securely in Vault
3. ✅ Scheduled to run daily at 9 AM UTC
4. ✅ Calls your Edge Function automatically
5. ✅ 5-minute timeout for processing
6. ✅ Full execution history tracking

**Just deploy** the migration (after updating the anon key) and you're done! 🎉

Questions? Check `EMAIL_SEQUENCE_SYSTEM.md` or email team@huurly.nl
