import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '@/lib/database';
import { ErrorHandler } from '@/lib/errors';
import { logger } from '@/lib/logger';

export interface Property {
  id: string;
  verhuurder_id: string;
  titel: string;
  beschrijving?: string;
  adres: string;
  stad: string;
  provincie?: string;
  postcode?: string;
  huurprijs: number;
  oppervlakte?: number;
  aantal_kamers?: number;
  aantal_slaapkamers?: number;
  woning_type: string;
  meubilering: string;
  voorzieningen?: string[];
  beschikbaar_vanaf?: string;
  status: 'actief' | 'inactief' | 'verhuurd';
  foto_urls?: string[];
  is_actief: boolean;
  aangemaakt_op: string;
  bijgewerkt_op: string;
}

export interface CreatePropertyData {
  titel: string;
  beschrijving?: string;
  adres: string;
  stad: string;
  provincie?: string;
  postcode?: string;
  huurprijs: number;
  oppervlakte?: number;
  aantal_kamers?: number;
  aantal_slaapkamers?: number;
  woning_type?: string;
  meubilering?: string;
  voorzieningen?: string[];
  beschikbaar_vanaf?: string;
  foto_urls?: string[];
  is_actief?: boolean;
}

export interface PropertySearchFilters {
  stad?: string;