CREATE TABLE IF NOT EXISTS public.opgeslagen_profielen (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    verhuurder_id uuid REFERENCES public.verhuurders(id) ON DELETE CASCADE,
    huurder_id uuid REFERENCES public.huurders(id) ON DELETE CASCADE,
    aangemaakt_op timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.opgeslagen_profielen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlord owns saved profiles" ON public.opgeslagen_profielen
USING (auth.uid() = verhuurder_id)
WITH CHECK (auth.uid() = verhuurder_id);

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

GRANT EXECUTE ON FUNCTION public.zoek_huurders(text, integer, integer, boolean, boolean) TO authenticated, anon;
