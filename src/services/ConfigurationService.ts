import { supabase } from '../integrations/supabase/client.ts';
import { DatabaseService, DatabaseResponse } from '../lib/database.ts';

export class ConfigurationService extends DatabaseService {
  /**
   * Get configuration value by key
   */
  async getConfig(key: string): Promise<DatabaseResponse<any>> {
    return this.executeQuery(async () => {
      const { data, error } = await (supabase as any)
        .from('system_config')
        .select('config_value')
        .eq('config_key', key)
        .eq('is_active', true)
        .single();

      return { data: data?.config_value, error };
    });
  }


  /**
   * Get default search limits
   */
  async getSearchLimits(): Promise<DatabaseResponse<any>> {
    return this.getConfig('default_search_limits');
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<DatabaseResponse<any>> {
    return this.getConfig('notification_settings');
  }

  /**
   * Get profile defaults
   */
  async getProfileDefaults(): Promise<DatabaseResponse<any>> {
    return this.getConfig('profile_defaults');
  }

  /**
   * Get empty state messages
   */
  async getEmptyStateMessages(): Promise<DatabaseResponse<any>> {
    return this.getConfig('empty_state_messages');
  }

  /**
   * Update configuration (admin only)
   */
  async updateConfig(key: string, value: any, description?: string): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang om configuratie te wijzigen'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await (supabase as any)
        .from('system_config')
        .upsert({
          config_key: key,
          config_value: value,
          description: description,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('UPDATE', 'system_config', key, null, data);

      return { data, error: null };
    });
  }

  /**
   * Get all configuration (admin only)
   */
  async getAllConfig(): Promise<DatabaseResponse<any[]>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot configuratie'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await (supabase as any)
        .from('system_config')
        .select('*')
        .eq('is_active', true)
        .order('config_key');

      return { data, error };
    });
  }
}

// Export singleton instance
export const configurationService = new ConfigurationService();
