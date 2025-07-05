-- Create properties table for landlords
CREATE TABLE public.woningen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verhuurder_id UUID NOT NULL REFERENCES public.verhuurders(id) ON DELETE CASCADE,
  titel TEXT NOT NULL,
  beschrijving TEXT,
  adres TEXT NOT NULL,
  stad TEXT NOT NULL,
  provincie TEXT,
  postcode TEXT,
  huurprijs INTEGER NOT NULL,
  oppervlakte INTEGER,
  aantal_kamers INTEGER,
  aantal_slaapkamers INTEGER,
  woning_type TEXT DEFAULT 'appartement',
  meubilering TEXT DEFAULT 'ongemeubileerd',
  voorzieningen TEXT[],
  beschikbaar_vanaf DATE,
  status TEXT DEFAULT 'actief' CHECK (status IN ('actief', 'inactief', 'verhuurd')),
  foto_urls TEXT[],
  is_actief BOOLEAN DEFAULT true,
  aangemaakt_op TIMESTAMPTZ DEFAULT now(),
  bijgewerkt_op TIMESTAMPTZ DEFAULT now()
);

-- Create applications table for tenant applications
CREATE TABLE public.aanvragen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  huurder_id UUID NOT NULL REFERENCES public.huurders(id) ON DELETE CASCADE,
  woning_id UUID NOT NULL REFERENCES public.woningen(id) ON DELETE CASCADE,
  verhuurder_id UUID NOT NULL REFERENCES public.verhuurders(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'wachtend' CHECK (status IN ('wachtend', 'geaccepteerd', 'afgewezen', 'ingetrokken')),
  bericht TEXT,
  aangemaakt_op TIMESTAMPTZ DEFAULT now(),
  bijgewerkt_op TIMESTAMPTZ DEFAULT now(),
  UNIQUE(huurder_id, woning_id)
);

-- Create viewing requests table
CREATE TABLE public.bezichtiging_verzoeken (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  huurder_id UUID NOT NULL REFERENCES public.huurders(id) ON DELETE CASCADE,
  woning_id UUID NOT NULL REFERENCES public.woningen(id) ON DELETE CASCADE,
  verhuurder_id UUID NOT NULL REFERENCES public.verhuurders(id) ON DELETE CASCADE,
  gewenste_datum TIMESTAMPTZ NOT NULL,
  alternatieve_datum TIMESTAMPTZ,
  status TEXT DEFAULT 'wachtend' CHECK (status IN ('wachtend', 'goedgekeurd', 'afgewezen', 'voltooid')),
  bevestigde_datum TIMESTAMPTZ,
  notities TEXT,
  aangemaakt_op TIMESTAMPTZ DEFAULT now(),
  bijgewerkt_op TIMESTAMPTZ DEFAULT now()
);

-- Create messages table for communication
CREATE TABLE public.berichten (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verzender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ontvanger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  woning_id UUID REFERENCES public.woningen(id) ON DELETE SET NULL,
  onderwerp TEXT,
  inhoud TEXT NOT NULL,
  gelezen BOOLEAN DEFAULT false,
  aangemaakt_op TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for all new tables
ALTER TABLE public.woningen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aanvragen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bezichtiging_verzoeken ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berichten ENABLE ROW LEVEL SECURITY;

-- RLS Policies for woningen (properties)
CREATE POLICY "Verhuurders kunnen eigen woningen beheren" ON public.woningen
FOR ALL USING (verhuurder_id = auth.uid());

CREATE POLICY "Huurders kunnen actieve woningen bekijken" ON public.woningen
FOR SELECT USING (
  is_actief = true AND 
  EXISTS (SELECT 1 FROM public.gebruikers WHERE id = auth.uid() AND rol = 'huurder')
);

-- RLS Policies for aanvragen (applications)
CREATE POLICY "Huurders kunnen eigen aanvragen beheren" ON public.aanvragen
FOR ALL USING (huurder_id = auth.uid());

CREATE POLICY "Verhuurders kunnen aanvragen voor eigen woningen bekijken" ON public.aanvragen
FOR SELECT USING (verhuurder_id = auth.uid());

CREATE POLICY "Verhuurders kunnen aanvragen voor eigen woningen bijwerken" ON public.aanvragen
FOR UPDATE USING (verhuurder_id = auth.uid());

-- RLS Policies for bezichtiging_verzoeken (viewing requests)
CREATE POLICY "Huurders kunnen eigen bezichtiging verzoeken beheren" ON public.bezichtiging_verzoeken
FOR ALL USING (huurder_id = auth.uid());

CREATE POLICY "Verhuurders kunnen bezichtiging verzoeken voor eigen woningen beheren" ON public.bezichtiging_verzoeken
FOR ALL USING (verhuurder_id = auth.uid());

-- RLS Policies for berichten (messages)
CREATE POLICY "Gebruikers kunnen eigen berichten bekijken" ON public.berichten
FOR SELECT USING (verzender_id = auth.uid() OR ontvanger_id = auth.uid());

CREATE POLICY "Gebruikers kunnen berichten versturen" ON public.berichten
FOR INSERT WITH CHECK (verzender_id = auth.uid());

CREATE POLICY "Ontvangers kunnen berichten als gelezen markeren" ON public.berichten
FOR UPDATE USING (ontvanger_id = auth.uid());

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_woningen_updated_at
  BEFORE UPDATE ON public.woningen
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bijgewerkt_op_column();

CREATE TRIGGER update_aanvragen_updated_at
  BEFORE UPDATE ON public.aanvragen
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bijgewerkt_op_column();

CREATE TRIGGER update_bezichtiging_verzoeken_updated_at
  BEFORE UPDATE ON public.bezichtiging_verzoeken
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bijgewerkt_op_column();

-- Create indexes for performance
CREATE INDEX idx_woningen_verhuurder ON public.woningen(verhuurder_id);
CREATE INDEX idx_woningen_stad ON public.woningen(stad);
CREATE INDEX idx_woningen_huurprijs ON public.woningen(huurprijs);
CREATE INDEX idx_woningen_status ON public.woningen(status, is_actief);

CREATE INDEX idx_aanvragen_huurder ON public.aanvragen(huurder_id);
CREATE INDEX idx_aanvragen_verhuurder ON public.aanvragen(verhuurder_id);
CREATE INDEX idx_aanvragen_woning ON public.aanvragen(woning_id);
CREATE INDEX idx_aanvragen_status ON public.aanvragen(status);

CREATE INDEX idx_berichten_ontvanger ON public.berichten(ontvanger_id, gelezen);
CREATE INDEX idx_berichten_verzender ON public.berichten(verzender_id);