
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface CreateNotificationData {
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_type?: string;
  related_id?: string;
}

export class NotificationService {
  static async createNotification(data: CreateNotificationData) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.user_id,
          type: data.type,
          title: data.title,
          message: data.message,
          related_type: data.related_type,
          related_id: data.related_id,
          read: false,
        });

      if (error) {
        logger.error('Error creating notification:', error);
        return { success: false, error };
      }

      logger.info('Notification created successfully:', data);
      return { success: true };
    } catch (error) {
      logger.error('Unexpected error creating notification:', error);
      return { success: false, error };
    }
  }

  static async notifyDocumentUploaded(userId: string, documentType: string) {
    return this.createNotification({
      user_id: userId,
      type: 'document_status',
      title: 'Document geüpload',
      message: `Je ${documentType} is succesvol geüpload en wordt beoordeeld.`,
      related_type: 'document',
      related_id: documentType,
    });
  }

  static async notifyDocumentApproved(userId: string, documentType: string) {
    return this.createNotification({
      user_id: userId,
      type: 'document_status',
      title: 'Document goedgekeurd',
      message: `Je ${documentType} is goedgekeurd en geverifieerd.`,
      related_type: 'document',
      related_id: documentType,
    });
  }

  static async notifyDocumentRejected(userId: string, documentType: string, reason: string) {
    return this.createNotification({
      user_id: userId,
      type: 'document_status',
      title: 'Document afgekeurd',
      message: `Je ${documentType} is afgekeurd. Reden: ${reason}`,
      related_type: 'document',
      related_id: documentType,
    });
  }

  static async notifyProfileViewed(userId: string, viewerName: string) {
    return this.createNotification({
      user_id: userId,
      type: 'profile_match',
      title: 'Profiel bekeken',
      message: `${viewerName} heeft je profiel bekeken.`,
      related_type: 'profile',
      related_id: userId,
    });
  }

  static async notifyPaymentRequired(userId: string) {
    return this.createNotification({
      user_id: userId,
      type: 'payment_required',
      title: 'Betaling vereist',
      message: 'Je abonnement is verlopen. Vernieuw je abonnement om toegang te behouden.',
      related_type: 'payment',
    });
  }

  static async notifyViewingInvitation(userId: string, propertyAddress: string, date: string) {
    return this.createNotification({
      user_id: userId,
      type: 'viewing_invitation',
      title: 'Bezichtiging uitnodiging',
      message: `Je bent uitgenodigd voor een bezichtiging op ${propertyAddress} op ${date}.`,
      related_type: 'viewing',
    });
  }

  static async notifySystemUpdate(userId: string, title: string, message: string) {
    return this.createNotification({
      user_id: userId,
      type: 'system',
      title,
      message,
      related_type: 'system',
    });
  }
}
