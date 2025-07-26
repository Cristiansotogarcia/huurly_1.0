-- Migration: Add missing telefoon field to huurders table
-- Created: 2025-01-03
-- Purpose: Add telefoon field that is mapped in profileDataMapper but missing from database

-- Add telefoon column to huurders table
ALTER TABLE public.huurders
ADD COLUMN IF NOT EXISTS telefoon TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.huurders.telefoon IS 'Telefoonnummer van de huurder';