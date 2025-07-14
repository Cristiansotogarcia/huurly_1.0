-- =================================================================
--  1. CREATE THE VIEW FIRST
--  The function below depends on this view, so it must be defined first.
-- =================================================================

CREATE OR REPLACE VIEW public.actieve_huurders AS
    SELECT
    h.id, -- The primary ID from the huurders table
    g.email, -- The user's email from the gebruikers table
    h.locatie_voorkeur,
    h.max_huur,
    h.huisdieren,
    h.roken,
    a.status as abonnement_status

    -- Add any other columns you need from huurders (h) or gebruikers (g)
  FROM
    public.huurders AS h
  JOIN
    public.gebruikers AS g ON h.id = g.id -- Joining on the correct columns
  JOIN
    public.abonnementen AS a ON h.id = a.huurder_id -- Join with subscriptions
  WHERE
    a.status = 'actief'; -- Filter for active subscriptions



-- =================================================================
--  2. NOW CREATE THE FUNCTION THAT USES THE VIEW
--  This will now succeed because its return type is defined.
-- =================================================================

CREATE OR REPLACE FUNCTION public.zoek_huurders(
    in_city text DEFAULT NULL,
    min_budget integer DEFAULT NULL,
    max_budget integer DEFAULT NULL,
    huisdieren boolean DEFAULT NULL,
    roken boolean DEFAULT NULL
)
RETURNS SETOF public.actieve_huurders
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.actieve_huurders h
  WHERE (in_city IS NULL OR in_city = ANY(h.locatie_voorkeur))
    AND (min_budget IS NULL OR h.max_huur >= min_budget)
    AND (max_budget IS NULL OR h.max_huur <= max_budget)
    AND (huisdieren IS NULL OR h.huisdieren = huisdieren)
    AND (roken IS NULL OR h.roken = roken);
END;
$$;

-- ... any other SQL in this file ...
