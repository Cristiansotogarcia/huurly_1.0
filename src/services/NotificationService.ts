import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '@/lib/database';
import { ErrorHandler } from '@/lib/errors';
import { logger } from '@/lib/logger';

export type NotificationType = 
  | 'document_goedgekeurd' 
  | 'document_afgekeurd' 
  | 'profiel_bekeken' 
  | 'nieuwe_match'
  | 'nieuwe_aanvraag'
  | 'aanvraag_geaccepteerd'
  | 'aanvraag_afgewezen'
  | 'bezichtiging_verzoek'
  | 'bezichtiging_bevestigd'
  | 'nieuw_bericht'
  | 'systeem';

export interface Notification {
  id: string;
  gebruiker_id: string;
  type: NotificationType;
  titel: string;
  inhoud: string;
  actie_url?: string;
  gelezen: boolean;
  aangemaakt_op: string;
}

export interface CreateNotificationData {
  gebruiker_id: string;
  type: NotificationType;
  titel: string;
  inhoud: string;
  actie_url?: string;
}

export class NotificationService extends DatabaseService {
  /**
   * Create a single notification
   */
  async createNotification(data: CreateNotificationData): Promise<DatabaseResponse<Notification>> {
    return this.executeQuery(async () => {
      const { data: notification, error } = await supabase
        .from('notificaties')
        .insert({
          gebruiker_id: data.gebruiker_id,
          type: data.type as any,
          titel: data.titel,
          inhoud: data.inhoud,
          actie_url: data.actie_url,
          gelezen: false,
        })
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      // Trigger real-time notification
      await this.triggerRealTimeNotification(data.gebruiker_id, notification);

      return { data: notification, error: null };
    });
  }

  /**
   * Create notifications for multiple users
   */
  async createBulkNotifications(notifications: CreateNotificationData[]): Promise<DatabaseResponse<Notification[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('notificaties')
        .insert(
          notifications.map(n => ({
            gebruiker_id: n.gebruiker_id,
            type: n.type as any,
            titel: n.titel,
            inhoud: n.inhoud,
            actie_url: n.actie_url,
            gelezen: false,
          }))
        )
        .select();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      // Trigger real-time notifications for all users
      for (const notification of data) {
        await this.triggerRealTimeNotification(notification.gebruiker_id, notification);
      }

      return { data: data || [], error: null };
    });
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<DatabaseResponse<Notification[]>> {
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
        .from('notificaties')
        .select('*')
        .eq('gebruiker_id', userId)
        .order('aangemaakt_op', { ascending: false })
        .limit(limit);

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: data || [], error: null };
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<DatabaseResponse<boolean>> {
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
        .from('notificaties')
        .update({ gelezen: true })
        .eq('id', notificationId)
        .eq('gebruiker_id', currentUserId);

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: true, error: null };
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<DatabaseResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId || currentUserId !== userId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { error } = await supabase
        .from('notificaties')
        .update({ gelezen: true })
        .eq('gebruiker_id', userId)
        .eq('gelezen', false);

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: true, error: null };
    });
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<DatabaseResponse<number>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId || currentUserId !== userId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { count, error } = await supabase
        .from('notificaties')
        .select('*', { count: 'exact', head: true })
        .eq('gebruiker_id', userId)
        .eq('gelezen', false);

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: count || 0, error: null };
    });
  }

  /**
   * Cross-dashboard notification methods
   */
  
  async notifyDocumentReviewed(huurder_id: string, documentType: string, status: 'goedgekeurd' | 'afgekeurd', notes?: string): Promise<void> {
    const titel = status === 'goedgekeurd' ? 'Document Goedgekeurd' : 'Document Afgekeurd';
    const inhoud = status === 'goedgekeurd' 
      ? `Je ${documentType} document is goedgekeurd!`
      : `Je ${documentType} document is afgekeurd. ${notes ? `Reden: ${notes}` : ''}`;

    await this.createNotification({
      gebruiker_id: huurder_id,
      type: status === 'goedgekeurd' ? 'document_goedgekeurd' : 'document_afgekeurd',
      titel,
      inhoud,
      actie_url: '/dashboard',
    });
  }

  async notifyNewApplication(verhuurder_id: string, huurder_naam: string, woning_titel: string): Promise<void> {
    await this.createNotification({
      gebruiker_id: verhuurder_id,
      type: 'nieuwe_aanvraag',
      titel: 'Nieuwe Aanvraag',
      inhoud: `${huurder_naam} heeft interesse getoond in je woning "${woning_titel}"`,
      actie_url: '/dashboard',
    });
  }

  async notifyApplicationResponse(huurder_id: string, woning_titel: string, status: 'geaccepteerd' | 'afgewezen'): Promise<void> {
    const titel = status === 'geaccepteerd' ? 'Aanvraag Geaccepteerd!' : 'Aanvraag Afgewezen';
    const inhoud = status === 'geaccepteerd'
      ? `Je aanvraag voor "${woning_titel}" is geaccepteerd!`
      : `Je aanvraag voor "${woning_titel}" is helaas afgewezen.`;

    await this.createNotification({
      gebruiker_id: huurder_id,
      type: status === 'geaccepteerd' ? 'aanvraag_geaccepteerd' : 'aanvraag_afgewezen',
      titel,
      inhoud,
      actie_url: '/dashboard',
    });
  }

  async notifyNewMessage(ontvanger_id: string, verzender_naam: string, onderwerp?: string): Promise<void> {
    await this.createNotification({
      gebruiker_id: ontvanger_id,
      type: 'nieuw_bericht',
      titel: 'Nieuw Bericht',
      inhoud: `Je hebt een nieuw bericht ontvangen van ${verzender_naam}${onderwerp ? ` over "${onderwerp}"` : ''}`,
      actie_url: '/dashboard/berichten',
    });
  }

  async notifyProfileViewed(huurder_id: string, verhuurder_naam: string): Promise<void> {
    await this.createNotification({
      gebruiker_id: huurder_id,
      type: 'profiel_bekeken',
      titel: 'Profiel Bekeken',
      inhoud: `${verhuurder_naam} heeft je profiel bekeken`,
      actie_url: '/dashboard',
    });
  }

  /**
   * Trigger real-time notification via Supabase channels
   */
  private async triggerRealTimeNotification(userId: string, notification: any): Promise<void> {
    try {
      const channel = supabase.channel(`notifications:${userId}`);
      await channel.send({
        type: 'broadcast',
        event: 'new-notification',
        payload: notification,
      });
    } catch (error) {
      logger.error('Failed to send real-time notification:', error);
    }
  }

  /**
   * Subscribe to real-time notifications for a user
   */
  subscribeToNotifications(userId: string, onNotification: (notification: Notification) => void) {
    const channel = supabase.channel(`notifications:${userId}`)
      .on('broadcast', { event: 'new-notification' }, ({ payload }) => {
        onNotification(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const notificationService = new NotificationService();