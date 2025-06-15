
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';

export const useNotificationActions = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        toast({
          title: "Fout",
          description: "Kon notificatie niet als gelezen markeren.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        toast({
          title: "Fout",
          description: "Kon notificaties niet als gelezen markeren.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Notificaties gelezen",
          description: "Alle notificaties zijn als gelezen gemarkeerd.",
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        toast({
          title: "Fout",
          description: "Kon notificatie niet verwijderen.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const createNotification = async (
    userId: string,
    type: string,
    title: string,
    message: string,
    relatedType?: string,
    relatedId?: string
  ) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          related_type: relatedType,
          related_id: relatedId,
          read: false,
        });

      if (error) {
        console.error('Error creating notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  };

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
  };
};
