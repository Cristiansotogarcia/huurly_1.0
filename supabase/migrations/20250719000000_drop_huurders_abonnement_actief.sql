-- Remove obsolete abonnement_actief column and update actieve_huurders view
DROP VIEW IF EXISTS public.actieve_huurders;
DROP POLICY IF EXISTS "actieve_huurders_verhuurders_only" ON public.actieve_huurders;

ALTER TABLE public.huurders DROP COLUMN IF EXISTS abonnement_actief;

CREATE VIEW public.actieve_huurders
WITH (security_invoker = true)
AS
SELECT
  h.id,
  g.naam,
  g.email,
  h.beroep,
  h.inkomen,
  h.max_huur,
  h.locatie_voorkeur,
  h.profielfoto_url,
  h.beschrijving,
  h.aangemaakt_op
FROM public.huurders h
JOIN public.gebruikers g ON h.id = g.id
WHERE EXISTS (
    SELECT 1 FROM public.abonnementen a
    WHERE a.huurder_id = h.id
      AND a.status = 'actief'
  )
  AND g.profiel_compleet = true;

REVOKE ALL ON public.actieve_huurders FROM anon, authenticated;
GRANT SELECT ON public.actieve_huurders TO authenticated;

CREATE POLICY "actieve_huurders_verhuurders_only" ON public.actieve_huurders
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('verhuurder', 'admin')
  );
