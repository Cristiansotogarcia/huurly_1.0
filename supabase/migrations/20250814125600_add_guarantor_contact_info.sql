ALTER TABLE public.huurders
ADD COLUMN IF NOT EXISTS borgsteller_email TEXT,
ADD COLUMN IF NOT EXISTS borgsteller_adres TEXT;