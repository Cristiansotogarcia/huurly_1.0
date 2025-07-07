-- Fix RLS policies for abonnementen table to resolve 406 errors

-- First, ensure the table exists and has proper structure
CREATE TABLE IF NOT EXISTS public.abonnementen (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    huurder_id uuid REFERENCES public.huurders(id) ON DELETE CASCADE,
    stripe_subscription_id text,
    stripe_customer_id text,
    stripe_sessie_id text,
    status public.abonnement_status NOT NULL,
    start_datum timestamptz NOT NULL,
    eind_datum timestamptz,
    bedrag numeric NOT NULL,
    currency text DEFAULT 'eur',
    expiration_reminder_sent boolean DEFAULT false,
    expiration_reminder_sent_at timestamptz,
    aangemaakt_op timestamptz NOT NULL DEFAULT now(),
    bijgewerkt_op timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.abonnementen ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Eigen abonnement" ON public.abonnementen;

-- Create comprehensive RLS policies
CREATE POLICY "abonnementen_select_policy" ON public.abonnementen
    FOR SELECT 
    USING (auth.uid() = huurder_id);

CREATE POLICY "abonnementen_insert_policy" ON public.abonnementen
    FOR INSERT 
    WITH CHECK (auth.uid() = huurder_id);

CREATE POLICY "abonnementen_update_policy" ON public.abonnementen
    FOR UPDATE 
    USING (auth.uid() = huurder_id)
    WITH CHECK (auth.uid() = huurder_id);

CREATE POLICY "abonnementen_delete_policy" ON public.abonnementen
    FOR DELETE 
    USING (auth.uid() = huurder_id);

-- Grant proper permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.abonnementen TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_abonnementen_huurder_id ON public.abonnementen(huurder_id);
CREATE INDEX IF NOT EXISTS idx_abonnementen_status ON public.abonnementen(status);
CREATE INDEX IF NOT EXISTS idx_abonnementen_stripe_subscription_id ON public.abonnementen(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_abonnementen_stripe_sessie_id ON public.abonnementen(stripe_sessie_id);

-- Ensure unique constraint exists
ALTER TABLE public.abonnementen 
ADD CONSTRAINT IF NOT EXISTS abonnementen_stripe_subscription_id_key 
UNIQUE (stripe_subscription_id);

-- Create a function to check subscription status (for debugging)
CREATE OR REPLACE FUNCTION public.check_subscription_access(user_uuid uuid)
RETURNS TABLE (
    can_access boolean,
    current_user_id uuid,
    target_user_id uuid,
    subscription_count bigint
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        auth.uid() = user_uuid as can_access,
        auth.uid() as current_user_id,
        user_uuid as target_user_id,
        (SELECT COUNT(*) FROM public.abonnementen WHERE huurder_id = user_uuid) as subscription_count;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.check_subscription_access(uuid) TO authenticated;