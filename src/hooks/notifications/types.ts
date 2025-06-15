
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  related_id?: string;
  related_type?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isDeleting: string | null;
  deletedNotificationIds: Set<string>;
}
