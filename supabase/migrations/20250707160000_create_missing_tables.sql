-- Create missing tables for Huurly application

-- Create enum for application status if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.aanvraag_status AS ENUM ('wachtend', 'geaccepteerd', 'afgewezen', 'ingetrokken');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create enum for property status if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.woning_status AS ENUM ('actief', 'inactief', 'verhuurd');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tabel woningen (Properties)
CREATE TABLE IF NOT EXISTS public.woningen (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    verhuurder_id uuid REFERENCES public.verhuurders(id) ON DELETE CASCADE,
    titel text NOT NULL,
    beschrijving text,
    adres text NOT NULL,
    stad text NOT NULL,
    provincie text,
    postcode text,
    huurprijs numeric NOT NULL,
    oppervlakte numeric,
    aantal_kamers integer,
    aantal_slaapkamers integer,
    woning_type text DEFAULT 'appartement',
    meubilering text DEFAULT 'ongemeubileerd',
    voorzieningen text[] DEFAULT '{}',
    beschikbaar_vanaf text,
    status public.woning_status DEFAULT 'actief',
    foto_urls text[] DEFAULT '{}',
    is_actief boolean DEFAULT true,
    aangemaakt_op timestamptz NOT NULL DEFAULT now(),
    bijgewerkt_op timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for woningen
ALTER TABLE public.woningen ENABLE ROW LEVEL SECURITY;

-- RLS policies for woningen
CREATE POLICY "Verhuurders kunnen eigen woningen beheren" ON public.woningen
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.gebruikers g 
      WHERE g.id = auth.uid() 
      AND g.rol = 'verhuurder' 
      AND g.id = verhuurder_id
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gebruikers g 
      WHERE g.id = auth.uid() 
      AND g.rol = 'verhuurder' 
      AND g.id = verhuurder_id
    )
  );

CREATE POLICY "Huurders kunnen actieve woningen bekijken" ON public.woningen
  FOR SELECT USING (
    is_actief = true 
    AND status = 'actief'
    AND EXISTS (
      SELECT 1 FROM public.gebruikers g 
      WHERE g.id = auth.uid() 
      AND g.rol = 'huurder'
    )
  );

-- Tabel aanvragen (Applications)
CREATE TABLE IF NOT EXISTS public.aanvragen (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    huurder_id uuid REFERENCES public.huurders(id) ON DELETE CASCADE,
    woning_id uuid REFERENCES public.woningen(id) ON DELETE CASCADE,
    verhuurder_id uuid REFERENCES public.verhuurders(id) ON DELETE CASCADE,
    status public.aanvraag_status DEFAULT 'wachtend',
    bericht text,
    aangemaakt_op timestamptz NOT NULL DEFAULT now(),
    bijgewerkt_op timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for aanvragen
ALTER TABLE public.aanvragen ENABLE ROW LEVEL SECURITY;

-- RLS policies for aanvragen
CREATE POLICY "Eigen aanvragen beheren" ON public.aanvragen
  FOR ALL USING (
    auth.uid() = huurder_id 
    OR auth.uid() = verhuurder_id
    OR EXISTS (
      SELECT 1 FROM public.gebruiker_rollen gr
      WHERE gr.user_id = auth.uid() AND gr.role IN ('admin')
    )
  ) WITH CHECK (
    auth.uid() = huurder_id 
    OR auth.uid() = verhuurder_id
  );

-- Tabel berichten (Messages)
CREATE TABLE IF NOT EXISTS public.berichten (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    verzender_id uuid REFERENCES public.gebruikers(id) ON DELETE CASCADE,
    ontvanger_id uuid REFERENCES public.gebruikers(id) ON DELETE CASCADE,
    woning_id uuid REFERENCES public.woningen(id) ON DELETE CASCADE,
    onderwerp text,
    inhoud text NOT NULL,
    gelezen boolean DEFAULT false,
    aangemaakt_op timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for berichten
ALTER TABLE public.berichten ENABLE ROW LEVEL SECURITY;

-- RLS policies for berichten
CREATE POLICY "Eigen berichten beheren" ON public.berichten
  FOR ALL USING (
    auth.uid() = verzender_id 
    OR auth.uid() = ontvanger_id
    OR EXISTS (
      SELECT 1 FROM public.gebruiker_rollen gr
      WHERE gr.user_id = auth.uid() AND gr.role IN ('admin')
    )
  ) WITH CHECK (
    auth.uid() = verzender_id
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_woningen_verhuurder_id ON public.woningen(verhuurder_id);
CREATE INDEX IF NOT EXISTS idx_woningen_stad ON public.woningen(stad);
CREATE INDEX IF NOT EXISTS idx_woningen_status ON public.woningen(status);
CREATE INDEX IF NOT EXISTS idx_woningen_huurprijs ON public.woningen(huurprijs);

CREATE INDEX IF NOT EXISTS idx_aanvragen_huurder_id ON public.aanvragen(huurder_id);
CREATE INDEX IF NOT EXISTS idx_aanvragen_woning_id ON public.aanvragen(woning_id);
CREATE INDEX IF NOT EXISTS idx_aanvragen_verhuurder_id ON public.aanvragen(verhuurder_id);
CREATE INDEX IF NOT EXISTS idx_aanvragen_status ON public.aanvragen(status);

CREATE INDEX IF NOT EXISTS idx_berichten_verzender_id ON public.berichten(verzender_id);
CREATE INDEX IF NOT EXISTS idx_berichten_ontvanger_id ON public.berichten(ontvanger_id);
CREATE INDEX IF NOT EXISTS idx_berichten_woning_id ON public.berichten(woning_id);
CREATE INDEX IF NOT EXISTS idx_berichten_gelezen ON public.berichten(gelezen);

-- Add foreign key constraints with proper naming
ALTER TABLE public.berichten 
ADD CONSTRAINT berichten_verzender_id_fkey 
FOREIGN KEY (verzender_id) REFERENCES public.gebruikers(id) ON DELETE CASCADE;

ALTER TABLE public.berichten 
ADD CONSTRAINT berichten_ontvanger_id_fkey 
FOREIGN KEY (ontvanger_id) REFERENCES public.gebruikers(id) ON DELETE CASCADE;

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.bijgewerkt_op = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER woningen_updated_at
  BEFORE UPDATE ON public.woningen
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER aanvragen_updated_at
  BEFORE UPDATE ON public.aanvragen
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();