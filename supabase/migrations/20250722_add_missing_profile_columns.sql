-- Migration: Add missing profile columns to huurders table
-- Created: 2025-07-22
-- Purpose: Add missing columns for enhanced profile creation modal

-- Add partner information columns
ALTER TABLE public.huurders
ADD COLUMN IF NOT EXISTS partner_naam text,
ADD COLUMN IF NOT EXISTS partner_beroep text,
ADD COLUMN IF NOT EXISTS partner_dienstverband text;

-- Add references and history columns
ALTER TABLE public.huurders
ADD COLUMN IF NOT EXISTS referenties_beschikbaar boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verhuurgeschiedenis_jaren integer;

-- Add housing preference columns
ALTER TABLE public.huurders
ADD COLUMN IF NOT EXISTS voorkeur_slaapkamers integer,
ADD COLUMN IF NOT EXISTS voorkeur_meubilering text,
ADD COLUMN IF NOT EXISTS huurcontract_voorkeur text;

-- Add storage preference columns
ALTER TABLE public.huurders
ADD COLUMN IF NOT EXISTS opslag_kelder boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS opslag_zolder boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS opslag_berging boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS opslag_garage boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS opslag_schuur boolean DEFAULT false;

-- Add cover photo column
ALTER TABLE public.huurders
ADD COLUMN IF NOT EXISTS cover_foto text;

-- Update comments for documentation
COMMENT ON COLUMN public.huurders.partner_naam IS 'Naam van de partner';
COMMENT ON COLUMN public.huurders.partner_beroep IS 'Beroep van de partner';
COMMENT ON COLUMN public.huurders.partner_dienstverband IS 'Dienstverband van de partner';
COMMENT ON COLUMN public.huurders.referenties_beschikbaar IS 'Of referenties beschikbaar zijn';
COMMENT ON COLUMN public.huurders.verhuurgeschiedenis_jaren IS 'Aantal jaren huurervaring';
COMMENT ON COLUMN public.huurders.voorkeur_slaapkamers IS 'Voorkeur aantal slaapkamers';
COMMENT ON COLUMN public.huurders.voorkeur_meubilering IS 'Voorkeur meubilering (gemeubileerd/ongemeubileerd/geen_voorkeur)';
COMMENT ON COLUMN public.huurders.huurcontract_voorkeur IS 'Voorkeur huurcontract duur';
COMMENT ON COLUMN public.huurders.opslag_kelder IS 'Heeft kelder opslag nodig';
COMMENT ON COLUMN public.huurders.opslag_zolder IS 'Heeft zolder opslag nodig';
COMMENT ON COLUMN public.huurders.opslag_berging IS 'Heeft berging opslag nodig';
COMMENT ON COLUMN public.huurders.opslag_garage IS 'Heeft garage opslag nodig';
COMMENT ON COLUMN public.huurders.opslag_schuur IS 'Heeft schuur opslag nodig';
COMMENT ON COLUMN public.huurders.cover_foto IS 'URL van cover foto';
