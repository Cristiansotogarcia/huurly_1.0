import { supabase } from '../integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '../lib/database';
import { logger } from '../lib/logger';

export class FavoritesService extends DatabaseService {
  async listSavedProfiles(landlordId: string): Promise<DatabaseResponse<string[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('favoriete_profielen')
        .select('huurder_id')
        .eq('verhuurder_id', landlordId);
      const ids = data ? data.map((d) => d.huurder_id) : [];
      return { data: ids as string[], error };
    });
  }

  async saveProfile(landlordId: string, tenantId: string): Promise<DatabaseResponse<null>> {
    return this.executeQuery(async () => {
      const { error } = await supabase
        .from('favoriete_profielen')
        .insert({ verhuurder_id: landlordId, huurder_id: tenantId });
      return { data: null, error };
    });
  }

  async removeProfile(landlordId: string, tenantId: string): Promise<DatabaseResponse<null>> {
    return this.executeQuery(async () => {
      const { error } = await supabase
        .from('favoriete_profielen')
        .delete()
        .eq('verhuurder_id', landlordId)
        .eq('huurder_id', tenantId);
      return { data: null, error };
    });
  }
}

export const favoritesService = new FavoritesService();
