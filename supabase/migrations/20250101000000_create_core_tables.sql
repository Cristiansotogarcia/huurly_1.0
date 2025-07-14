-- Create enums if they don't exist
DO $$ BEGIN
  CREATE TYPE public.gebruiker_rol AS ENUM ('huurder', 'verhuurder', 'beoordelaar', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.document_status AS ENUM ('wachtend', 'goedgekeurd', 'afgekeurd');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.document_type AS ENUM ('identiteit','inkomen','referentie','uittreksel_bkr','arbeidscontract');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.notificatie_type AS ENUM ('document_goedgekeurd','document_afgekeurd','profiel_bekeken','nieuwe_match','systeem');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.abonnement_status AS ENUM ('actief','gepauzeerd','geannuleerd','verlopen');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tabel gebruikers
CREATE TABLE IF NOT EXISTS public.gebruikers (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    naam text NOT NULL,
    telefoon text,
    rol public.gebruiker_rol NOT NULL,
    profiel_compleet boolean,
    aangemaakt_op timestamptz NOT NULL DEFAULT now(),
    bijgewerkt_op timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gebruikers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Eigen gebruiker" ON public.gebruikers
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Tabel huurders
CREATE TABLE IF NOT EXISTS public.huurders (
    id uuid PRIMARY KEY REFERENCES public.gebruikers(id) ON DELETE CASCADE,
    beroep text,
    beschikbaarheid_flexibel boolean,
    beschrijving text,
    borgsteller_beschikbaar boolean,
    borgsteller_inkomen numeric,
    borgsteller_naam text,
    borgsteller_relatie text,
    borgsteller_telefoon text,
    huisdieren boolean,
    inkomen numeric,
    inkomensbewijs_beschikbaar boolean,
    kinderen integer,
    leeftijd integer,
    locatie_voorkeur text[],
    max_huur numeric,
    max_kamers integer,
    min_kamers integer,
    partner boolean,
    profielfoto_url text,
    roken boolean,
    abonnement_start text,
    abonnement_verloopt text,
    voorkeur_verhuisdatum text,
    vroegste_verhuisdatum text,
    woningvoorkeur jsonb,
    aangemaakt_op timestamptz NOT NULL DEFAULT now(),
    bijgewerkt_op timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.huurders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Eigen huurder" ON public.huurders
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Tabel verhuurders
CREATE TABLE IF NOT EXISTS public.verhuurders (
    id uuid PRIMARY KEY REFERENCES public.gebruikers(id) ON DELETE CASCADE,
    bedrijfsnaam text,
    beschrijving text,
    aantal_woningen integer,
    website text,
    aangemaakt_op timestamptz NOT NULL DEFAULT now(),
    bijgewerkt_op timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.verhuurders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Eigen verhuurder" ON public.verhuurders
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Tabel beoordelaars
CREATE TABLE IF NOT EXISTS public.beoordelaars (
    id uuid PRIMARY KEY REFERENCES public.gebruikers(id) ON DELETE CASCADE,
    documenten_beoordeeld integer,
    goedkeuringspercentage numeric,
    aangemaakt_op timestamptz NOT NULL DEFAULT now(),
    bijgewerkt_op timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.beoordelaars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Eigen beoordelaar" ON public.beoordelaars
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Tabel documenten
CREATE TABLE IF NOT EXISTS public.documenten (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    huurder_id uuid REFERENCES public.huurders(id) ON DELETE CASCADE,
    beoordelaar_id uuid REFERENCES public.beoordelaars(id),
    bestandsnaam text NOT NULL,
    bestand_url text NOT NULL,
    beoordeling_notitie text,
    type public.document_type NOT NULL,
    status public.document_status,
    aangemaakt_op timestamptz NOT NULL DEFAULT now(),
    bijgewerkt_op timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.documenten ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Eigen documenten" ON public.documenten
  FOR ALL USING (
    auth.uid() = huurder_id OR EXISTS (
      SELECT 1 FROM public.gebruiker_rollen gr
      WHERE gr.user_id = auth.uid() AND gr.role IN ('beoordelaar','admin')
    )
  ) WITH CHECK (auth.uid() = huurder_id);

-- Tabel verificaties
CREATE TABLE IF NOT EXISTS public.verificaties (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    huurder_id uuid REFERENCES public.huurders(id) ON DELETE CASCADE,
    document_id uuid REFERENCES public.documenten(id) ON DELETE CASCADE,
    beoordelaar_id uuid REFERENCES public.beoordelaars(id),
    notitie text,
    status public.document_status,
    aangemaakt_op timestamptz NOT NULL DEFAULT now(),
    bijgewerkt_op timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.verificaties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Huurder of reviewer" ON public.verificaties
  USING (
    auth.uid() = huurder_id OR EXISTS (
      SELECT 1 FROM public.gebruiker_rollen gr
      WHERE gr.user_id = auth.uid() AND gr.role IN ('beoordelaar','admin')
    )
  );

-- Tabel notificaties
CREATE TABLE IF NOT EXISTS public.notificaties (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    gebruiker_id uuid REFERENCES public.gebruikers(id) ON DELETE CASCADE,
    titel text NOT NULL,
    inhoud text NOT NULL,
    actie_url text,
    gelezen boolean,
    type public.notificatie_type NOT NULL,
    aangemaakt_op timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notificaties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Eigen notificaties" ON public.notificaties
  USING (auth.uid() = gebruiker_id);

-- Tabel abonnementen
CREATE TABLE IF NOT EXISTS public.abonnementen (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    huurder_id uuid REFERENCES public.huurders(id) ON DELETE CASCADE,
    stripe_subscription_id text,
    stripe_customer_id text,
    status public.abonnement_status NOT NULL,
    start_datum text NOT NULL,
    eind_datum text,
    bedrag numeric NOT NULL,
    currency text,
    aangemaakt_op timestamptz NOT NULL DEFAULT now(),
    bijgewerkt_op timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.abonnementen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Eigen abonnement" ON public.abonnementen
  USING (auth.uid() = huurder_id) WITH CHECK (auth.uid() = huurder_id);


