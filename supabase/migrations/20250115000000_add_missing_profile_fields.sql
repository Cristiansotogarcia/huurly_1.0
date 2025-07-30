-- =================================================================
-- ADD MISSING PROFILE FIELDS TO HUURDERS TABLE
-- =================================================================

-- Add missing columns for enhanced profile data
ALTER TABLE public.huurders 
ADD COLUMN IF NOT EXISTS aantal_huisgenoten INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS huidige_woonsituatie TEXT CHECK (huidige_woonsituatie IN 
    ('studentenkamer', 'studio', 'appartement', 'huis', 'bij_familie', 'hotel', 'anders')),
ADD COLUMN IF NOT EXISTS borgsteller_details JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS reden_verhuizing TEXT,
ADD COLUMN IF NOT EXISTS verhuurgeschiedenis_jaren INTEGER DEFAULT 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_huurders_aantal_huisgenoten ON public.huurders(aantal_huisgenoten);
CREATE INDEX IF NOT EXISTS idx_huurders_huidige_woonsituatie ON public.huurders(huidige_woonsituatie);
CREATE INDEX IF NOT EXISTS idx_huurders_reden_verhuizing ON public.huurders(reden_verhuizing);

-- Add comments for new columns
COMMENT ON COLUMN public.huurders.aantal_huisgenoten IS 'Aantal huisgenoten in huidige woonsituatie';
COMMENT ON COLUMN public.huurders.huidige_woonsituatie IS 'Huidige woonsituatie van de huurder';
COMMENT ON COLUMN public.huurders.borgsteller_details IS 'Gedetailleerde informatie over de borgsteller in JSON formaat';
COMMENT ON COLUMN public.huurders.reden_verhuizing IS 'Reden voor verhuizing';
COMMENT ON COLUMN public.huurders.verhuurgeschiedenis_jaren IS 'Aantal jaren huurgeschiedenis';

-- Update existing records with default values where needed
UPDATE public.huurders 
SET 
    aantal_huisgenoten = COALESCE(aantal_huisgenoten, 0),
    verhuurgeschiedenis_jaren = COALESCE(verhuurgeschiedenis_jaren, 0)
WHERE aantal_huisgenoten IS NULL OR verhuurgeschiedenis_jaren IS NULL;