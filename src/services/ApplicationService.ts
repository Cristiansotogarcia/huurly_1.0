import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '@/lib/database';
import { ErrorHandler } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { notificationService } from './NotificationService';

export interface Application {
  id: string;
  huurder_id: string;
  woning_id: string;
  verhuurder_id: string;
  status: 'wachtend' | 'geaccepteerd' | 'afgewezen' | 'ingetrokken';
  bericht?: string;
  aangemaakt_op: string;
  bijgewerkt_op: string;
}

export interface CreateApplicationData {
  woning_id: string;
  bericht?: string;
}

export class ApplicationService extends DatabaseService {
  async createApplication(data: CreateApplicationData): Promise<DatabaseResponse<Application>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get property and landlord info
      const { data: property, error: propError } = await supabase
        .from('woningen')
        .select('verhuurder_id, titel')
        .eq('id', data.woning_id)
        .single();

      if (propError || !property) {
        throw new Error('Woning niet gevonden');
      }

      // Check if application already exists
      const { data: existing } = await supabase
        .from('aanvragen')
        .select('id')
        .eq('huurder_id', currentUserId)
        .eq('woning_id', data.woning_id)
        .maybeSingle();

      if (existing) {
        throw new Error('Je hebt al een aanvraag ingediend voor deze woning');
      }

      // Create application
      const { data: application, error } = await supabase
        .from('aanvragen')
        .insert({
          huurder_id: currentUserId,
          woning_id: data.woning_id,
          verhuurder_id: property.verhuurder_id,
          bericht: data.bericht,
          status: 'wachtend',
        })
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      // Get tenant name for notification
      const { data: tenant } = await supabase
        .from('gebruikers')
        .select('naam')
        .eq('id', currentUserId)
        .single();

      // Send notification to landlord
      await notificationService.notifyNewApplication(
        property.verhuurder_id,
        tenant?.naam || 'Nieuwe huurder',
        property.titel
      );

      await this.createAuditLog('CREATE', 'aanvragen', application.id, currentUserId, application);

      return { data: application as Application, error: null };
    });
  }

  async getApplications(userId?: string): Promise<DatabaseResponse<Application[]>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      let query = supabase
        .from('aanvragen')
        .select(`
          *,
          woningen (
            titel,
            adres,
            stad,
            huurprijs
          ),
          huurders (
            naam,
            email,
            profielfoto_url
          )
        `)
        .order('aangemaakt_op', { ascending: false });

      // Check user role to determine what applications to show
      const { data: user } = await supabase
        .from('gebruikers')
        .select('rol')
        .eq('id', currentUserId)
        .single();

      if (user?.rol === 'huurder') {
        query = query.eq('huurder_id', currentUserId);
      } else if (user?.rol === 'verhuurder') {
        query = query.eq('verhuurder_id', currentUserId);
      }

      const { data, error } = await query;

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: (data || []) as Application[], error: null };
    });
  }

  async updateApplicationStatus(
    applicationId: string, 
    status: 'geaccepteerd' | 'afgewezen'
  ): Promise<DatabaseResponse<Application>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get application details for notification
      const { data: application, error: fetchError } = await supabase
        .from('aanvragen')
        .select(`
          *,
          woningen (titel)
        `)
        .eq('id', applicationId)
        .eq('verhuurder_id', currentUserId)
        .single();

      if (fetchError || !application) {
        throw new Error('Aanvraag niet gevonden of geen toegang');
      }

      // Update application status
      const { data: updatedApplication, error } = await supabase
        .from('aanvragen')
        .update({ 
          status,
          bijgewerkt_op: new Date().toISOString()
        })
        .eq('id', applicationId)
        .eq('verhuurder_id', currentUserId)
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      // Send notification to tenant
      await notificationService.notifyApplicationResponse(
        application.huurder_id,
        (application as any).woningen?.titel || 'Woning',
        status
      );

      await this.createAuditLog('UPDATE', 'aanvragen', applicationId, currentUserId, {
        old_status: application.status,
        new_status: status
      });

      return { data: updatedApplication as Application, error: null };
    });
  }

  async withdrawApplication(applicationId: string): Promise<DatabaseResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { error } = await supabase
        .from('aanvragen')
        .update({ 
          status: 'ingetrokken',
          bijgewerkt_op: new Date().toISOString()
        })
        .eq('id', applicationId)
        .eq('huurder_id', currentUserId);

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      await this.createAuditLog('UPDATE', 'aanvragen', applicationId, currentUserId, {
        action: 'withdrawn'
      });

      return { data: true, error: null };
    });
  }

  async deleteApplication(applicationId: string): Promise<DatabaseResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { error } = await supabase
        .from('aanvragen')
        .delete()
        .eq('id', applicationId)
        .eq('huurder_id', currentUserId);

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      await this.createAuditLog('DELETE', 'aanvragen', applicationId, currentUserId, null);

      return { data: true, error: null };
    });
  }

  async getApplicationStats(userId: string): Promise<DatabaseResponse<{
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  }>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId || currentUserId !== userId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('aanvragen')
        .select('status')
        .eq('huurder_id', userId);

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      const stats = {
        total: data.length,
        pending: data.filter(app => app.status === 'wachtend').length,
        accepted: data.filter(app => app.status === 'geaccepteerd').length,
        rejected: data.filter(app => app.status === 'afgewezen').length,
      };

      return { data: stats, error: null };
    });
  }
}

export const applicationService = new ApplicationService();