-- ✅ Fix abonnementen table: convert string-based dates to proper timestamptz

DO $$
BEGIN
  -- Convert start_datum if still text
  BEGIN
    ALTER TABLE public.abonnementen 
    ALTER COLUMN start_datum TYPE timestamptz 
    USING (start_datum || 'T00:00:00Z')::timestamptz;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Kolom start_datum is al timestamptz. Skipping...';
  END;

  -- Convert eind_datum if still text
  BEGIN
    ALTER TABLE public.abonnementen 
    ALTER COLUMN eind_datum TYPE timestamptz 
    USING (eind_datum || 'T00:00:00Z')::timestamptz;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Kolom eind_datum is al timestamptz. Skipping...';
  END;
END
$$;

-- ✅ Create or update function: check_expiring_subscriptions
CREATE OR REPLACE FUNCTION check_expiring_subscriptions()
RETURNS void AS $$
BEGIN
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
    'Je jaarlijkse abonnement verloopt op ' || a.eind_datum::date || 
      '. Verleng je abonnement om toegang te behouden tot alle functies.',
    false
  FROM public.abonnementen a
  WHERE a.status = 'actief'
    AND a.eind_datum::date = (CURRENT_DATE + INTERVAL '14 days')::date
    AND (a.expiration_reminder_sent IS NULL OR a.expiration_reminder_sent = false);

  UPDATE public.abonnementen
  SET 
    expiration_reminder_sent = true,
    expiration_reminder_sent_at = NOW()
  WHERE status = 'actief'
    AND eind_datum::date = (CURRENT_DATE + INTERVAL '14 days')::date
    AND (expiration_reminder_sent IS NULL OR expiration_reminder_sent = false);
END;
$$ LANGUAGE plpgsql;

-- ✅ Create or update function: expire_subscriptions
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE public.abonnementen
  SET 
    status = 'verlopen',
    bijgewerkt_op = NOW()
  WHERE status = 'actief'
    AND eind_datum::date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
