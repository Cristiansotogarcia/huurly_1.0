import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { notificationService } from '@/services/NotificationService';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
  related_id?: string;
  related_type?: string;
}

export const useNotifications = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = async () => {
    if (!user) return;
    const result = await notificationService.getUserNotifications();
    if (result.success && result.data) {
      setNotifications(result.data as Notification[]);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createNotification = async (data: { userId: string; type: string; title: string; message: string; relatedId?: string; relatedType?: string; }) => {
    const result = await notificationService.createNotification({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedId: data.relatedId,
      relatedType: data.relatedType
    });

    if (result.success && result.data) {
      if (data.userId === user?.id) {
        toast({ title: data.title, description: data.message });
      }
      await loadNotifications();
      return result.data as Notification;
    }
    return null;
  };

  const markAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    await loadNotifications();
  };

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
    await loadNotifications();
  };

  const deleteNotification = async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
    await loadNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};

// Cross-dashboard notification helpers
export const notifyDocumentUploaded = (uploaderName: string, documentType: string, beoordelaarId: string) => {
  notificationService.createNotification({
    userId: beoordelaarId,
    type: 'document_uploaded',
    title: 'Nieuw document te beoordelen',
    message: `${uploaderName} heeft een ${documentType} document geüpload.`
  });
};

export const notifyDocumentApproved = (huurderName: string, documentType: string, huurderUserId: string) => {
  notificationService.createNotification({
    userId: huurderUserId,
    type: 'document_approved',
    title: 'Document goedgekeurd!',
    message: `Je ${documentType} document is goedgekeurd en geverifieerd.`
  });
};

export const notifyDocumentRejected = (huurderName: string, documentType: string, reason: string, huurderUserId: string) => {
  notificationService.createNotification({
    userId: huurderUserId,
    type: 'document_rejected',
    title: 'Document afgewezen',
    message: `Je ${documentType} document is afgewezen. Reden: ${reason}`
  });
};

export const notifyViewingInvitation = (verhuurderName: string, propertyAddress: string, viewingDate: string, huurderUserId: string) => {
  notificationService.createNotification({
    userId: huurderUserId,
    type: 'viewing_invitation',
    title: 'Uitnodiging voor bezichtiging',
    message: `${verhuurderName} nodigt je uit voor een bezichtiging van ${propertyAddress} op ${viewingDate}.`
  });
};

export const notifyApplicationReceived = (huurderName: string, propertyAddress: string, verhuurderUserId: string) => {
  notificationService.createNotification({
    userId: verhuurderUserId,
    type: 'application_received',
    title: 'Nieuwe huuranvraag',
    message: `${huurderName} heeft een aanvraag ingediend voor ${propertyAddress}.`
  });
};

export const notifyUserSuspended = (userName: string, reason: string, userId: string) => {
  notificationService.createNotification({
    userId: userId,
    type: 'user_suspended',
    title: 'Account geschorst',
    message: `Je account is tijdelijk geschorst. Reden: ${reason}`
  });
};

export const notifyIssueResolved = (issueTitle: string, resolution: string, userId: string) => {
  notificationService.createNotification({
    userId: userId,
    type: 'issue_resolved',
    title: 'Issue opgelost',
    message: `Je gemelde issue "${issueTitle}" is opgelost. ${resolution}`
  });
};
