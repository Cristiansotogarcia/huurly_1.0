
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
  const callbacksRef = useRef({
    onNotificationAdded,
    onNotificationUpdated,
    onNotificationDeleted,
    toast,
  });

  // Update the callbacksRef each render so that the realtime handlers always use the latest version
  useEffect(() => {
    callbacksRef.current = {
      onNotificationAdded,
      onNotificationUpdated,
      onNotificationDeleted,
      toast,
    };
  }, [onNotificationAdded, onNotificationUpdated, onNotificationDeleted, toast]);

  useEffect(() => {
    // Only re-create channel if user id changes
    if (!user) {
      if (channelRef.current) {
        console.log('Cleaning up notification subscription - user logged out');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Tear down any previous channel before creating a new one
    if (channelRef.current) {
      console.log('Cleaning up previous notification channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create new channel for this user
    console.log('Setting up real-time notification subscription for user:', user.id);

    const channel = supabase
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
          const { onNotificationAdded, onNotificationUpdated, onNotificationDeleted, toast } = callbacksRef.current;
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
      )
      .subscribe((status: string, err: any) => {
        console.log(`Notification channel subscription status: ${status}`);
        if (status === 'CHANNEL_ERROR') {
          console.error('Subscription error:', err);
          supabase.removeChannel(channel);
          if (channelRef.current === channel) {
            channelRef.current = null;
          }
        }
      });

    channelRef.current = channel;

    // Cleanup when user or user.id changes
    return () => {
      if (channelRef.current) {
        console.log('Cleaning up notification subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  // Depend only on user?.id so channel is only managed on login/logout or user switch
  }, [user?.id]);
};
