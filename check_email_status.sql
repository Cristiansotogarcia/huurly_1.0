-- Check if any emails were sent in the email sequence
-- Run this in Supabase SQL Editor

-- 1. Check recent email logs
SELECT 
  esl.id,
  u.email as user_email,
  esl.sequence_type,
  esl.email_number,
  esl.sent_at,
  esl.status,
  esl.error_message,
  esl.resend_message_id
FROM email_sequence_log esl
JOIN auth.users u ON esl.user_id = u.id
ORDER BY esl.sent_at DESC
LIMIT 20;

-- 2. Check users who should have received emails

-- Unverified users (2+ days old)
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  EXTRACT(DAY FROM (NOW() - created_at)) as days_since_signup
FROM auth.users
WHERE email_confirmed_at IS NULL
  AND created_at < NOW() - INTERVAL '2 days'
ORDER BY created_at DESC;

-- Unpaid verified users
SELECT * FROM get_unpaid_verified_users();

-- Paid but incomplete users
SELECT * FROM get_paid_incomplete_users();

-- 3. Check cron job execution
SELECT 
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-email-sequences-daily')
ORDER BY start_time DESC
LIMIT 5;

-- 4. Check if RESEND environment variables are set
-- You need to verify this in Supabase Dashboard > Project Settings > Edge Functions > Environment Variables
-- Required vars:
-- - RESEND_API_KEY
-- - RESEND_FROM_EMAIL (or defaults to team@huurly.nl)
-- - EMAIL_BCC_MONITORING (or defaults to team@huurly.nl)
