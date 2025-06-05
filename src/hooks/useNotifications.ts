import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  userId: string;
  type: 'document_uploaded' | 'document_approved' | 'document_rejected' | 'viewing_invitation' | 'application_received' | 'user_suspended' | 'issue_resolved';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

// Global notification store
let globalNotifications: Notification[] = [];
let notificationListeners: ((notifications: Notification[]) => void)[] = [];

const notifyListeners = () => {
  notificationListeners.forEach(listener => listener([...globalNotifications]));
};

export const useNotifications = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    // Filter notifications for current user
    const userNotifications = globalNotifications.filter(n => n.userId === user.id);
    setNotifications(userNotifications);

    // Add listener for real-time updates
    const listener = (allNotifications: Notification[]) => {
      const userNotifications = allNotifications.filter(n => n.userId === user.id);
      setNotifications(userNotifications);
    };

    notificationListeners.push(listener);

    return () => {
      const index = notificationListeners.indexOf(listener);
      if (index > -1) {
        notificationListeners.splice(index, 1);
      }
    };
  }, [user]);

  const createNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      read: false
    };

    globalNotifications.unshift(newNotification);
    notifyListeners();

    // Show toast for real-time feedback
    if (notification.userId === user?.id) {
      toast({
        title: notification.title,
        description: notification.message
      });
    }

    return newNotification;
  };

  const markAsRead = (notificationId: string) => {
    const notification = globalNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      notifyListeners();
    }
  };

  const markAllAsRead = () => {
    globalNotifications
      .filter(n => n.userId === user?.id)
      .forEach(n => n.read = true);
    notifyListeners();
  };

  const deleteNotification = (notificationId: string) => {
    const index = globalNotifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      globalNotifications.splice(index, 1);
      notifyListeners();
    }
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
  const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
    userId: beoordelaarId,
    type: 'document_uploaded',
    title: 'Nieuw document te beoordelen',
    message: `${uploaderName} heeft een ${documentType} document geüpload.`,
    data: { uploaderName, documentType }
  };

  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    read: false
  };

  globalNotifications.unshift(newNotification);
  notifyListeners();
};

export const notifyDocumentApproved = (huurderName: string, documentType: string, huurderUserId: string) => {
  const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
    userId: huurderUserId,
    type: 'document_approved',
    title: 'Document goedgekeurd!',
    message: `Je ${documentType} document is goedgekeurd en geverifieerd.`,
    data: { documentType }
  };

  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    read: false
  };

  globalNotifications.unshift(newNotification);
  notifyListeners();
};

export const notifyDocumentRejected = (huurderName: string, documentType: string, reason: string, huurderUserId: string) => {
  const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
    userId: huurderUserId,
    type: 'document_rejected',
    title: 'Document afgewezen',
    message: `Je ${documentType} document is afgewezen. Reden: ${reason}`,
    data: { documentType, reason }
  };

  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    read: false
  };

  globalNotifications.unshift(newNotification);
  notifyListeners();
};

export const notifyViewingInvitation = (verhuurderName: string, propertyAddress: string, viewingDate: string, huurderUserId: string) => {
  const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
    userId: huurderUserId,
    type: 'viewing_invitation',
    title: 'Uitnodiging voor bezichtiging',
    message: `${verhuurderName} nodigt je uit voor een bezichtiging van ${propertyAddress} op ${viewingDate}.`,
    data: { verhuurderName, propertyAddress, viewingDate }
  };

  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    read: false
  };

  globalNotifications.unshift(newNotification);
  notifyListeners();
};

export const notifyApplicationReceived = (huurderName: string, propertyAddress: string, verhuurderUserId: string) => {
  const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
    userId: verhuurderUserId,
    type: 'application_received',
    title: 'Nieuwe huuranvraag',
    message: `${huurderName} heeft een aanvraag ingediend voor ${propertyAddress}.`,
    data: { huurderName, propertyAddress }
  };

  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    read: false
  };

  globalNotifications.unshift(newNotification);
  notifyListeners();
};

export const notifyUserSuspended = (userName: string, reason: string, userId: string) => {
  const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
    userId: userId,
    type: 'user_suspended',
    title: 'Account geschorst',
    message: `Je account is tijdelijk geschorst. Reden: ${reason}`,
    data: { reason }
  };

  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    read: false
  };

  globalNotifications.unshift(newNotification);
  notifyListeners();
};

export const notifyIssueResolved = (issueTitle: string, resolution: string, userId: string) => {
  const notification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
    userId: userId,
    type: 'issue_resolved',
    title: 'Issue opgelost',
    message: `Je gemelde issue "${issueTitle}" is opgelost. ${resolution}`,
    data: { issueTitle, resolution }
  };

  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    read: false
  };

  globalNotifications.unshift(newNotification);
  notifyListeners();
};
