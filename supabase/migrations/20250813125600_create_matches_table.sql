-- Create matches table for tenant-property matching
CREATE TABLE IF NOT EXISTS public.matches (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    huurder_id uuid NOT NULL REFERENCES public.huurders(id) ON DELETE CASCADE,
    woning_id uuid NOT NULL REFERENCES public.woningen(id) ON DELETE CASCADE,
    score numeric NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'applied', 'rejected', 'accepted', 'saved')),
    aangemaakt_op timestamptz NOT NULL DEFAULT now(),
    bijgewerkt_op timestamptz NOT NULL DEFAULT now(),
    UNIQUE(huurder_id, woning_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_huurder_id ON public.matches(huurder_id);
CREATE INDEX IF NOT EXISTS idx_matches_woning_id ON public.matches(woning_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_score ON public.matches(score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_aangemaakt_op ON public.matches(aangemaakt_op DESC);

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Huurders kunnen eigen matches bekijken" ON public.matches
FOR SELECT USING (auth.uid() = huurder_id);

CREATE POLICY "Huurders kunnen eigen matches beheren" ON public.matches
FOR ALL USING (auth.uid() = huurder_id) WITH CHECK (auth.uid() = huurder_id);

CREATE POLICY "Verhuurders kunnen matches voor eigen woningen bekijken" ON public.matches
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.woningen w 
        WHERE w.id = woning_id AND w.verhuurder_id = auth.uid()
    )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.bijgewerkt_op = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER matches_updated_at
    BEFORE UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.matches IS 'Matches between tenants and properties based on preferences and scoring algorithm';
COMMENT ON COLUMN public.matches.score IS 'Match score between 0 and 100';
COMMENT ON COLUMN public.matches.status IS 'Match status: pending, viewed, applied, rejected, accepted, saved';
