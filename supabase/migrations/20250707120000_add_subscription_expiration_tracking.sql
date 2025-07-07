-- Add expiration notification tracking to abonnementen table
ALTER TABLE public.abonnementen
ADD COLUMN IF NOT EXISTS expiration_reminder_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS expiration_reminder_sent_at timestamptz;

-- Create function to check for expiring subscriptions (2 weeks before expiry)
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
    'Je jaarlijkse abonnement verloopt op ' || a.eind_datum || '. Verleng je abonnement om toegang te behouden tot alle functies.',
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

-- Create function to expire subscriptions
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_abonnementen_status_eind_datum 
ON public.abonnementen (status, eind_datum);

CREATE INDEX IF NOT EXISTS idx_abonnementen_expiration_reminder 
ON public.abonnementen (expiration_reminder_sent, eind_datum);

-- Note: In production, you would set up a cron job or scheduled task to call:
-- SELECT check_expiring_subscriptions();
-- SELECT expire_subscriptions();
-- This should be run daily.