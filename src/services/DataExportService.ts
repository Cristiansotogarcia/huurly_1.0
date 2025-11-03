import { supabase } from '../integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '../lib/database';
import { logger } from '../lib/logger';

interface ExportedUserData {
  profile: any;
  tenantProfile: any;
  subscription: any;
  documents: any[];
  messages: any[];
  applications: any[];
  notifications: any[];
  savedProfiles: any[];
  exportDate: string;
  dataRetentionNotice: string;
}

class DataExportService extends DatabaseService {
  /**
   * Export all user data in a structured JSON format (GDPR compliance)
   */
  async exportUserData(userId: string): Promise<DatabaseResponse<ExportedUserData>> {
    return this.executeQuery(async () => {
      logger.info(`Starting data export for user: ${userId}`);

      // Validate user is requesting their own data
      const currentUserId = await this.getCurrentUserId();
      if (currentUserId !== userId) {
        throw new Error('Je kunt alleen je eigen gegevens exporteren');
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from('gebruikers')
        .select('*')
        .eq('id', userId)
        .single();

      // Fetch tenant profile (if exists)
      const { data: tenantProfile } = await supabase
        .from('huurders')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // Fetch subscription data
      const { data: subscription } = await supabase
        .from('abonnementen')
        .select('*')
        .eq('huurder_id', userId);

      // Fetch documents
      const { data: documents } = await supabase
        .from('documenten')
        .select('*')
        .eq('huurder_id', userId);

      // Fetch messages (sent and received)
      const { data: sentMessages } = await supabase
        .from('berichten')
        .select('*')
        .eq('verzender_id', userId);

      const { data: receivedMessages } = await supabase
        .from('berichten')
        .select('*')
        .eq('ontvanger_id', userId);

      const messages = [
        ...(sentMessages || []).map(m => ({ ...m, direction: 'sent' })),
        ...(receivedMessages || []).map(m => ({ ...m, direction: 'received' }))
      ];

      // Fetch applications
      const { data: applications } = await supabase
        .from('aanvragen')
        .select('*')
        .eq('huurder_id', userId);

      // Fetch notifications
      const { data: notifications } = await supabase
        .from('notificaties')
        .select('*')
        .eq('gebruiker_id', userId);

      // Fetch saved profiles
      const { data: savedProfiles } = await supabase
        .from('opgeslagen_profielen')
        .select('*')
        .eq('gebruiker_id', userId);

      // Compile all data with GDPR-compliant structure
      const exportedData: ExportedUserData = {
        profile: this.sanitizeExportData(profile),
        tenantProfile: this.sanitizeExportData(tenantProfile),
        subscription: this.sanitizeExportData(subscription),
        documents: this.sanitizeExportData(documents || []),
        messages: this.sanitizeExportData(messages),
        applications: this.sanitizeExportData(applications || []),
        notifications: this.sanitizeExportData(notifications || []),
        savedProfiles: this.sanitizeExportData(savedProfiles || []),
        exportDate: new Date().toISOString(),
        dataRetentionNotice: 'Deze gegevens worden bewaard volgens ons privacybeleid. Je hebt het recht om verwijdering te vragen.'
      };

      logger.info(`Data export completed successfully for user: ${userId}`);

      return { data: exportedData, error: null };
    });
  }

  /**
   * Sanitize data for export - remove internal system fields
   */
  private sanitizeExportData(data: any): any {
    if (!data) return null;

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeExportData(item));
    }

    if (typeof data === 'object') {
      const sanitized = { ...data };
      
      // Remove internal fields that users don't need in export
      delete sanitized.id; // Keep for reference but could be removed
      
      return sanitized;
    }

    return data;
  }

  /**
   * Download exported data as JSON file
   */
  downloadDataAsJson(data: ExportedUserData, filename: string = 'huurly-data-export.json'): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    logger.info(`Data export file downloaded: ${filename}`);
  }
}

export const dataExportService = new DataExportService();
