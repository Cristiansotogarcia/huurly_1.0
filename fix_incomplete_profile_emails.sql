-- Fix incomplete profile email sequence by backfilling missing payment_completed events
-- The Edge Function needs payment_completed events to calculate days since payment
-- We'll use abonnementen.aangemaakt_op as the payment date

-- Step 1: Backfill payment_completed events for all active subscriptions
INSERT INTO user_lifecycle_events (user_id, event_type, created_at, event_data)
SELECT 
  a.huurder_id as user_id,
  'payment_completed' as event_type,
  a.aangemaakt_op as created_at,  -- Use subscription creation time as payment time
  jsonb_build_object(
    'subscription_id', a.stripe_subscription_id,
    'amount', a.bedrag,
    'currency', a.currency,
    'backfilled', true
  ) as event_data
FROM public.abonnementen a
WHERE a.status = 'actief'
  AND NOT EXISTS (
    SELECT 1 FROM user_lifecycle_events 
    WHERE user_id = a.huurder_id 
    AND event_type = 'payment_completed'
  );

-- Step 2: Verify events were created
SELECT 
  'Payment events created' as status,
  COUNT(*) as count
FROM user_lifecycle_events
WHERE event_type = 'payment_completed';

-- Step 3: Check the 2 incomplete profile users now have payment dates
SELECT 
  u.email,
  u.email_confirmed_at,
  a.aangemaakt_op as subscription_created,
  (SELECT created_at FROM user_lifecycle_events 
   WHERE user_id = u.id AND event_type = 'payment_completed' 
   ORDER BY created_at DESC LIMIT 1) as payment_event_date,
  EXTRACT(DAY FROM (NOW() - (SELECT created_at FROM user_lifecycle_events 
   WHERE user_id = u.id AND event_type = 'payment_completed' 
   ORDER BY created_at DESC LIMIT 1))) as days_since_payment
FROM auth.users u
INNER JOIN public.abonnementen a ON u.id = a.huurder_id AND a.status = 'actief'
INNER JOIN public.gebruikers g ON u.id = g.id
WHERE COALESCE(g.profiel_compleet, false) = false;

-- Step 4: Manually trigger the email checker to send emails immediately
-- (Replace YOUR_ANON_KEY with your actual anon key from Settings > API)
SELECT net.http_post(
  url := 'https://sqhultitvpivlnlgogen.supabase.co/functions/v1/check-email-sequences',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer YOUR_ANON_KEY'
  ),
  body := jsonb_build_object('time', now())
);

-- Step 5: Check if emails were sent
SELECT 
  u.email,
  esl.sequence_type,
  esl.email_number,
  esl.sent_at,
  esl.status
FROM email_sequence_log esl
JOIN auth.users u ON esl.user_id = u.id
WHERE esl.sequence_type = 'incomplete_profile'
ORDER BY esl.sent_at DESC;

-- Step 6: Summary
SELECT 
  'Total incomplete profile emails sent' as metric,
  COUNT(*) as value
FROM email_sequence_log
WHERE sequence_type = 'incomplete_profile';
