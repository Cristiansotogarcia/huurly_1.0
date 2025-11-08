-- Diagnose why incomplete profile users aren't receiving emails
-- Run in Supabase SQL Editor

-- 1. Check the 2 incomplete profile users in detail
SELECT 
  u.id,
  u.email,
  u.created_at as account_created,
  u.email_confirmed_at,
  g.profiel_compleet,
  a.status as subscription_status,
  a.start_datum,
  a.eind_datum,
  -- Check for payment_completed event
  (SELECT created_at FROM user_lifecycle_events 
   WHERE user_id = u.id AND event_type = 'payment_completed' 
   ORDER BY created_at DESC LIMIT 1) as payment_event_date,
  -- Days since payment event (if exists)
  CASE 
    WHEN EXISTS(SELECT 1 FROM user_lifecycle_events WHERE user_id = u.id AND event_type = 'payment_completed')
    THEN EXTRACT(DAY FROM (NOW() - (SELECT created_at FROM user_lifecycle_events WHERE user_id = u.id AND event_type = 'payment_completed' ORDER BY created_at DESC LIMIT 1)))
    ELSE NULL
  END as days_since_payment_event,
  -- Days since start_datum (fallback if no payment event)
  CASE 
    WHEN a.start_datum IS NOT NULL 
    THEN EXTRACT(DAY FROM (NOW() - a.start_datum))
    ELSE NULL
  END as days_since_subscription_start
FROM auth.users u
INNER JOIN public.abonnementen a ON u.id = a.huurder_id AND a.status = 'actief'
INNER JOIN public.gebruikers g ON u.id = g.id
WHERE COALESCE(g.profiel_compleet, false) = false;

-- 2. Check if user_lifecycle_events table has payment_completed events
SELECT 
  COUNT(*) as total_payment_events,
  COUNT(DISTINCT user_id) as unique_users_with_payment_events
FROM user_lifecycle_events
WHERE event_type = 'payment_completed';

-- 3. Check all lifecycle events for these 2 users
SELECT 
  u.email,
  ule.event_type,
  ule.created_at,
  ule.event_data
FROM user_lifecycle_events ule
JOIN auth.users u ON ule.user_id = u.id
WHERE ule.user_id IN (
  SELECT u.id
  FROM auth.users u
  INNER JOIN public.abonnementen a ON u.id = a.huurder_id AND a.status = 'actief'
  INNER JOIN public.gebruikers g ON u.id = g.id
  WHERE COALESCE(g.profiel_compleet, false) = false
)
ORDER BY u.email, ule.created_at;

-- 4. Check if emails were attempted or failed
SELECT 
  u.email,
  esl.sequence_type,
  esl.email_number,
  esl.status,
  esl.error_message,
  esl.sent_at
FROM email_sequence_log esl
JOIN auth.users u ON esl.user_id = u.id
WHERE esl.sequence_type = 'incomplete_profile'
ORDER BY esl.sent_at DESC;
