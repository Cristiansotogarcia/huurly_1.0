-- Add 'wachtend' (pending/waiting) status to the abonnement_status enum
ALTER TYPE public.abonnement_status ADD VALUE 'wachtend';

-- Add stripe_sessie_id column to abonnementen table if it doesn't exist
-- (This ensures compatibility with the webhook that expects this field)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'abonnementen' 
        AND column_name = 'stripe_sessie_id'
    ) THEN
        ALTER TABLE public.abonnementen ADD COLUMN stripe_sessie_id TEXT;
    END IF;
END $$;