
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from './types';

interface UseNotificationRealtimeProps {
  onNotificationAdded: (notification: Notification) => void;
  onNotificationUpdated: (notification: Notification) => void;
  onNotificationDeleted: (notificationId: string) => void;
}

export const useNotificationRealtime = ({
  onNotificationAdded,
  onNotificationUpdated,
  onNotificationDeleted
}: UseNotificationRealtimeProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      if (channelRef.current && isSubscribedRef.current) {
        console.log('Cleaning up notification subscription - user logged out');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
      return;
    }

    if (!channelRef.current && !isSubscribedRef.current) {
      console.log('Setting up real-time notification subscription for user:', user.id);
      
      channelRef.current = supabase
        .channel(`notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          payload => {
            console.log('Real-time notification event:', payload.eventType, payload);
            
            if (payload.eventType === 'INSERT') {
              const newNotif = payload.new as Notification;
              onNotificationAdded(newNotif);
              toast({ title: newNotif.title, description: newNotif.message });
            }
            
            if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Notification;
              onNotificationUpdated(updated);
            }
            
            if (payload.eventType === 'DELETE') {
              const oldId = (payload.old as Notification).id;
              onNotificationDeleted(oldId);
            }
          }
        );

      channelRef.current.subscribe((status: string) => {
        console.log('Notification channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });
    }

    return () => {
      if (channelRef.current && isSubscribedRef.current) {
        console.log('Cleaning up notification subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [user?.id, onNotificationAdded, onNotificationUpdated, onNotificationDeleted, toast]);
};
