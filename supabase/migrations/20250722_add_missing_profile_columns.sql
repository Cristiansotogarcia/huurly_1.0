-- Add missing columns for enhanced profile functionality
-- These columns were referenced by the frontend but missing from the database

-- Add stad column for storing the primary city
ALTER TABLE public.huurders 
ADD COLUMN IF NOT EXISTS stad TEXT;

-- Add maandinkomen column as duplicate of inkomen for validation purposes
ALTER TABLE public.huurders 
ADD COLUMN IF NOT EXISTS maandinkomen NUMERIC;

-- Add slaapkamers column derived from min_kamers
ALTER TABLE public.huurders 
ADD COLUMN IF NOT EXISTS slaapkamers INTEGER;

-- Add woningtype column as legacy field parallel to voorkeur_woningtype
ALTER TABLE public.huurders 
ADD COLUMN IF NOT EXISTS woningtype TEXT CHECK (woningtype IN ('appartement', 'huis', 'studio', 'kamer', 'penthouse'));

-- Add thuiswerken boolean column
ALTER TABLE public.huurders 
ADD COLUMN IF NOT EXISTS thuiswerken BOOLEAN;

-- Add parkeren_vereist boolean column
ALTER TABLE public.huurders 
ADD COLUMN IF NOT EXISTS parkeren_vereist BOOLEAN;

-- Add comments for documentation
COMMENT ON COLUMN public.huurders.stad IS 'Primary city preference (first from locatie_voorkeur)';
COMMENT ON COLUMN public.huurders.maandinkomen IS 'Monthly income (duplicate of inkomen for validation)';
COMMENT ON COLUMN public.huurders.slaapkamers IS 'Number of bedrooms preference (derived from min_kamers)';
COMMENT ON COLUMN public.huurders.woningtype IS 'Property type preference (legacy field, parallel to voorkeur_woningtype)';
COMMENT ON COLUMN public.huurders.thuiswerken IS 'Whether the tenant works from home';
COMMENT ON COLUMN public.huurders.parkeren_vereist IS 'Whether parking is required';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_huurders_stad ON public.huurders(stad);
CREATE INDEX IF NOT EXISTS idx_huurders_maandinkomen ON public.huurders(maandinkomen);
CREATE INDEX IF NOT EXISTS idx_huurders_slaapkamers ON public.huurders(slaapkamers);
CREATE INDEX IF NOT EXISTS idx_huurders_woningtype ON public.huurders(woningtype);
CREATE INDEX IF NOT EXISTS idx_huurders_thuiswerken ON public.huurders(thuiswerken);
CREATE INDEX IF NOT EXISTS idx_huurders_parkeren_vereist ON public.huurders(parkeren_vereist);
