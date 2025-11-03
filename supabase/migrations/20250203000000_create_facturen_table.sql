-- Create facturen (invoices) table for storing generated invoices
CREATE TABLE IF NOT EXISTS public.facturen (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    factuur_nummer text NOT NULL UNIQUE,
    factuur_datum timestamptz NOT NULL DEFAULT now(),
    
    -- Customer information
    gebruiker_id uuid NOT NULL REFERENCES public.gebruikers(id) ON DELETE CASCADE,
    klant_naam text NOT NULL,
    klant_email text NOT NULL,
    
    -- Payment details
    bedrag_totaal numeric(10, 2) NOT NULL,
    bedrag_excl_btw numeric(10, 2) NOT NULL,
    btw_bedrag numeric(10, 2) NOT NULL,
    btw_percentage numeric(5, 2) DEFAULT 21.00,
    valuta text DEFAULT 'EUR',
    
    -- Service details
    service_beschrijving text NOT NULL,
    abonnement_type text,
    
    -- Related payment/transaction
    transactie_id text NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    stripe_sessie_id text,
    
    -- Invoice content
    factuur_html text NOT NULL,
    
    -- Status tracking
    verzonden boolean DEFAULT true,
    verzonden_op timestamptz,
    bekeken boolean DEFAULT false,
    bekeken_op timestamptz,
    
    -- Timestamps
    aangemaakt_op timestamptz DEFAULT now(),
    bijgewerkt_op timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.facturen ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own invoices
CREATE POLICY "Users can view their own invoices" ON public.facturen
    FOR SELECT USING (auth.uid() = gebruiker_id);

-- Admins (beheerders) can view all invoices
CREATE POLICY "Admins can view all invoices" ON public.facturen
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.gebruikers
            WHERE id = auth.uid() AND rol = 'beheerder'
        )
    );

-- Service role can insert invoices (for webhook/function)
CREATE POLICY "Service role can insert invoices" ON public.facturen
    FOR INSERT WITH CHECK (true);

-- Service role can update invoices
CREATE POLICY "Service role can update invoices" ON public.facturen
    FOR UPDATE USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_facturen_gebruiker_id ON public.facturen(gebruiker_id);
CREATE INDEX idx_facturen_factuur_nummer ON public.facturen(factuur_nummer);
CREATE INDEX idx_facturen_factuur_datum ON public.facturen(factuur_datum);
CREATE INDEX idx_facturen_transactie_id ON public.facturen(transactie_id);
CREATE INDEX idx_facturen_stripe_subscription_id ON public.facturen(stripe_subscription_id);

-- Create trigger to update bijgewerkt_op
CREATE OR REPLACE FUNCTION update_facturen_bijgewerkt_op()
RETURNS TRIGGER AS $$
BEGIN
    NEW.bijgewerkt_op = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_facturen_bijgewerkt_op_trigger
    BEFORE UPDATE ON public.facturen
    FOR EACH ROW
    EXECUTE FUNCTION update_facturen_bijgewerkt_op();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.facturen TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.facturen TO service_role;

-- Add comment
COMMENT ON TABLE public.facturen IS 'Stores generated invoices for administration and customer access';
