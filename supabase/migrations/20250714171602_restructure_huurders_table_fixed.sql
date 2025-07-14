-- =================================================================
-- RESTRUCTURE HUURDERS TABLE - DUTCH NAMING & ENHANCED MODAL MAPPING
-- =================================================================

-- Step 1: Add missing columns with proper Dutch names
ALTER TABLE public.huurders 
ADD COLUMN IF NOT EXISTS voornaam TEXT,
ADD COLUMN IF NOT EXISTS achternaam TEXT,
ADD COLUMN IF NOT EXISTS geboortedatum DATE,
ADD COLUMN IF NOT EXISTS geslacht TEXT CHECK (geslacht IN ('man', 'vrouw', 'anders', 'zeg_ik_liever_niet')),
ADD COLUMN IF NOT EXISTS nationaliteit TEXT,
ADD COLUMN IF NOT EXISTS burgerlijke_staat TEXT CHECK (burgerlijke_staat IN ('single', 'samenwonend', 'getrouwd', 'gescheiden')),
ADD COLUMN IF NOT EXISTS werkgever TEXT,
ADD COLUMN IF NOT EXISTS dienstverband TEXT CHECK (dienstverband IN ('full-time', 'part-time', 'zzp', 'student', 'werkloos')),
ADD COLUMN IF NOT EXISTS voorkeur_woningtype TEXT CHECK (voorkeur_woningtype IN ('appartement', 'huis', 'studio')),
ADD COLUMN IF NOT EXISTS min_budget NUMERIC,
ADD COLUMN IF NOT EXISTS huisdier_details TEXT,
ADD COLUMN IF NOT EXISTS rook_details TEXT,
ADD COLUMN IF NOT EXISTS motivatie TEXT,
ADD COLUMN IF NOT EXISTS profiel_foto TEXT,
ADD COLUMN IF NOT EXISTS cover_foto TEXT;

-- Step 2: Data migration for existing records (BEFORE dropping columns)
-- Migrate existing data where possible
UPDATE public.huurders 
SET 
    has_children = CASE WHEN kinderen > 0 THEN true ELSE false END,
    number_of_children = COALESCE(kinderen, 0)
WHERE has_children IS NULL AND kinderen IS NOT NULL;

-- Step 3: Rename English columns to Dutch equivalents
ALTER TABLE public.huurders 
RENAME COLUMN has_children TO heeft_kinderen;

ALTER TABLE public.huurders 
RENAME COLUMN number_of_children TO aantal_kinderen;

ALTER TABLE public.huurders 
RENAME COLUMN children_ages TO kinderen_leeftijden;

ALTER TABLE public.huurders 
RENAME COLUMN partner_income TO partner_inkomen;

ALTER TABLE public.huurders 
RENAME COLUMN extra_income TO extra_inkomen;

ALTER TABLE public.huurders 
RENAME COLUMN extra_income_description TO extra_inkomen_beschrijving;

-- Step 4: Remove redundant 'kinderen' column (replaced by heeft_kinderen + aantal_kinderen)
ALTER TABLE public.huurders 
DROP COLUMN IF EXISTS kinderen;

-- Step 5: Rename other columns for consistency
ALTER TABLE public.huurders 
RENAME COLUMN profielfoto_url TO profielfoto_url_old;

-- Step 6: Update constraints and add comments
COMMENT ON COLUMN public.huurders.voornaam IS 'Voornaam van de huurder';
COMMENT ON COLUMN public.huurders.achternaam IS 'Achternaam van de huurder';
COMMENT ON COLUMN public.huurders.geboortedatum IS 'Geboortedatum van de huurder';
COMMENT ON COLUMN public.huurders.geslacht IS 'Geslacht van de huurder';
COMMENT ON COLUMN public.huurders.nationaliteit IS 'Nationaliteit van de huurder';
COMMENT ON COLUMN public.huurders.burgerlijke_staat IS 'Burgerlijke staat van de huurder';
COMMENT ON COLUMN public.huurders.werkgever IS 'Werkgever van de huurder';
COMMENT ON COLUMN public.huurders.dienstverband IS 'Type dienstverband van de huurder';
COMMENT ON COLUMN public.huurders.voorkeur_woningtype IS 'Voorkeur voor type woning';
COMMENT ON COLUMN public.huurders.min_budget IS 'Minimum budget voor huur';
COMMENT ON COLUMN public.huurders.huisdier_details IS 'Details over huisdieren';
COMMENT ON COLUMN public.huurders.rook_details IS 'Details over rookgewoonten';
COMMENT ON COLUMN public.huurders.motivatie IS 'Motivatie van de huurder';
COMMENT ON COLUMN public.huurders.profiel_foto IS 'URL naar profielfoto';
COMMENT ON COLUMN public.huurders.cover_foto IS 'URL naar cover foto';
COMMENT ON COLUMN public.huurders.heeft_kinderen IS 'Heeft de huurder kinderen';
COMMENT ON COLUMN public.huurders.aantal_kinderen IS 'Aantal kinderen';
COMMENT ON COLUMN public.huurders.kinderen_leeftijden IS 'Leeftijden van de kinderen';
COMMENT ON COLUMN public.huurders.partner_inkomen IS 'Inkomen van partner';
COMMENT ON COLUMN public.huurders.extra_inkomen IS 'Extra inkomen';
COMMENT ON COLUMN public.huurders.extra_inkomen_beschrijving IS 'Beschrijving van extra inkomen';

-- Step 7: Create function to calculate age from birth date
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Step 8: Update trigger to automatically calculate age when birth date changes
CREATE OR REPLACE FUNCTION update_leeftijd_from_geboortedatum()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.geboortedatum IS NOT NULL THEN
        NEW.leeftijd = calculate_age(NEW.geboortedatum);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_leeftijd ON public.huurders;
CREATE TRIGGER trigger_update_leeftijd
    BEFORE INSERT OR UPDATE OF geboortedatum ON public.huurders
    FOR EACH ROW
    EXECUTE FUNCTION update_leeftijd_from_geboortedatum();

-- Step 9: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_huurders_geboortedatum ON public.huurders(geboortedatum);
CREATE INDEX IF NOT EXISTS idx_huurders_voorkeur_woningtype ON public.huurders(voorkeur_woningtype);
CREATE INDEX IF NOT EXISTS idx_huurders_min_max_budget ON public.huurders(min_budget, max_huur);
CREATE INDEX IF NOT EXISTS idx_huurders_heeft_kinderen ON public.huurders(heeft_kinderen);
CREATE INDEX IF NOT EXISTS idx_huurders_huisdieren ON public.huurders(huisdieren);
CREATE INDEX IF NOT EXISTS idx_huurders_roken ON public.huurders(roken);

-- Step 11: Update RLS policies if needed
-- The existing RLS policies should continue to work as they reference the id column