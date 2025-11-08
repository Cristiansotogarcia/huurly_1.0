-- Check why only 2 unpaid users received emails instead of 11
-- Run in Supabase SQL Editor

-- 1. Check which unpaid users received emails
SELECT 
  u.email,
  esl.sequence_type,
  esl.email_number,
  esl.sent_at,
  esl.status
FROM email_sequence_log esl
JOIN auth.users u ON esl.user_id = u.id
WHERE esl.sequence_type = 'unpaid'
ORDER BY esl.sent_at DESC;

-- 2. Check all 11 unpaid users and why they didn't get emails
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  EXTRACT(DAY FROM (NOW() - u.email_confirmed_at)) as days_since_verification,
  -- Check if already sent
  (SELECT MAX(email_number) FROM email_sequence_log WHERE user_id = u.id AND sequence_type = 'unpaid') as last_email_sent,
  -- Check if unsubscribed
  (SELECT unsubscribed_from_reminders FROM email_preferences WHERE user_id = u.id) as unsubscribed
FROM auth.users u
LEFT JOIN public.abonnementen a ON u.id = a.huurder_id AND a.status = 'actief'
WHERE u.email_confirmed_at IS NOT NULL
  AND a.id IS NULL
ORDER BY u.email_confirmed_at DESC;

-- 3. Check the 2 incomplete profile users
SELECT 
  u.id,
  u.email,
  u.created_at,
  COALESCE(g.profiel_compleet, false) as profiel_compleet,
  -- Check payment date
  (SELECT created_at FROM user_lifecycle_events 
   WHERE user_id = u.id AND event_type = 'payment_completed' 
   ORDER BY created_at DESC LIMIT 1) as payment_date,
  -- Days since payment
  CASE 
    WHEN EXISTS(SELECT 1 FROM user_lifecycle_events WHERE user_id = u.id AND event_type = 'payment_completed')
    THEN EXTRACT(DAY FROM (NOW() - (SELECT created_at FROM user_lifecycle_events WHERE user_id = u.id AND event_type = 'payment_completed' ORDER BY created_at DESC LIMIT 1)))
    ELSE NULL
  END as days_since_payment,
  -- Check if email sent
  (SELECT MAX(email_number) FROM email_sequence_log WHERE user_id = u.id AND sequence_type = 'incomplete_profile') as last_email_sent
FROM auth.users u
INNER JOIN public.abonnementen a ON u.id = a.huurder_id AND a.status = 'actief'
INNER JOIN public.gebruikers g ON u.id = g.id
WHERE COALESCE(g.profiel_compleet, false) = false;

-- 4. Summary: Why emails weren't sent
WITH unpaid_analysis AS (
  SELECT 
    u.id,
    EXTRACT(DAY FROM (NOW() - u.email_confirmed_at)) as days_since_verification,
    (SELECT MAX(email_number) FROM email_sequence_log WHERE user_id = u.id AND sequence_type = 'unpaid') as last_email_sent
  FROM auth.users u
  LEFT JOIN public.abonnementen a ON u.id = a.huurder_id AND a.status = 'actief'
  WHERE u.email_confirmed_at IS NOT NULL AND a.id IS NULL
)
SELECT 
  'Total Unpaid Users' as category,
  COUNT(*) as count
FROM unpaid_analysis

UNION ALL

SELECT 
  'Qualified for Day 1 Email (1+ days)',
  COUNT(*)
FROM unpaid_analysis
WHERE days_since_verification >= 1

UNION ALL

SELECT 
  'Qualified for Day 3 Email (3+ days)',
  COUNT(*)
FROM unpaid_analysis
WHERE days_since_verification >= 3

UNION ALL

SELECT 
  'Qualified for Day 7 Email (7+ days)',
  COUNT(*)
FROM unpaid_analysis
WHERE days_since_verification >= 7

UNION ALL

SELECT 
  'Qualified for Day 14 Email (14+ days)',
  COUNT(*)
FROM unpaid_analysis
WHERE days_since_verification >= 14

UNION ALL

SELECT 
  'Already Received Email',
  COUNT(*)
FROM unpaid_analysis
WHERE last_email_sent IS NOT NULL;
