-- Fix abonnementen table to use proper date types for better date handling
-- This ensures that date calculations work correctly

-- First, update any existing text dates to proper timestamps
UPDATE public.abonnementen 
SET 
  start_datum = (start_datum || 'T00:00:00Z')::timestamptz
WHERE start_datum !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}';

UPDATE public.abonnementen 
SET 
  eind_datum = (eind_datum || 'T00:00:00Z')::timestamptz
WHERE eind_datum !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}';

-- Change column types to timestamptz for proper date handling
ALTER TABLE public.abonnementen 
ALTER COLUMN start_datum TYPE timestamptz USING start_datum::timestamptz;

ALTER TABLE public.abonnementen 
ALTER COLUMN eind_datum TYPE timestamptz USING eind_datum::timestamptz;

-- Update the expiration check function to use proper date comparison
CREATE OR REPLACE FUNCTION check_expiring_subscriptions()
RETURNS void AS $$
BEGIN
  -- Insert notifications for subscriptions expiring in 2 weeks
  -- that haven't already been notified
  INSERT INTO public.notificaties (
    gebruiker_id,
    type,
    titel,
    inhoud,
    gelezen
  )
  SELECT 
    a.huurder_id,
    'systeem',
    'Abonnement verloopt binnenkort',
    'Je jaarlijkse abonnement verloopt op ' || a.eind_datum::date || '. Verleng je abonnement om toegang te behouden tot alle functies.',
    false
  FROM public.abonnementen a
  WHERE a.status = 'actief'
    AND a.eind_datum::date = (CURRENT_DATE + INTERVAL '14 days')::date
    AND (a.expiration_reminder_sent IS NULL OR a.expiration_reminder_sent = false);

  -- Mark subscriptions as reminded
  UPDATE public.abonnementen
  SET 
    expiration_reminder_sent = true,
    expiration_reminder_sent_at = NOW()
  WHERE status = 'actief'
    AND eind_datum::date = (CURRENT_DATE + INTERVAL '14 days')::date
    AND (expiration_reminder_sent IS NULL OR expiration_reminder_sent = false);
END;
$$ LANGUAGE plpgsql;

-- Update the expiration function to use proper date comparison
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
  -- Update status to 'verlopen' for subscriptions that have expired
  UPDATE public.abonnementen
  SET 
    status = 'verlopen',
    bijgewerkt_op = NOW()
  WHERE status = 'actief'
    AND eind_datum::date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;