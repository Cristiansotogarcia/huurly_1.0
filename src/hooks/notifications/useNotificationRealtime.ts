
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
  const cleanupPromiseRef = useRef<Promise<any> | null>(null);
  const callbacksRef = useRef({
    onNotificationAdded,
    onNotificationUpdated,
    onNotificationDeleted,
    toast,
  });

  useEffect(() => {
    callbacksRef.current = {
      onNotificationAdded,
      onNotificationUpdated,
      onNotificationDeleted,
      toast,
    };
  }, [onNotificationAdded, onNotificationUpdated, onNotificationDeleted, toast]);

  useEffect(() => {
    let isMounted = true;

    const setupChannel = async () => {
      if (!user) {
        if (channelRef.current) {
          console.log('[Realtime Notifications] Cleaning up because no user present');
          cleanupPromiseRef.current = supabase.removeChannel(channelRef.current);
          await cleanupPromiseRef.current;
          if (isMounted) channelRef.current = null;
          cleanupPromiseRef.current = null;
        }
        return;
      }

      if (channelRef.current) {
        console.log('[Realtime Notifications] Existing channel found, cleaning up before creating new one');
        cleanupPromiseRef.current = supabase.removeChannel(channelRef.current);
        await cleanupPromiseRef.current;
        if (isMounted) channelRef.current = null;
        cleanupPromiseRef.current = null;
      }

      if (cleanupPromiseRef.current) {
        console.log('[Realtime Notifications] Awaiting previous cleanup before setting up new channel');
        await cleanupPromiseRef.current;
        cleanupPromiseRef.current = null;
      }

      console.log('[Realtime Notifications] Setting up subscription for user:', user.id);
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
            console.log('[Realtime Notifications] Event received:', payload.eventType, payload);

            if (payload.eventType === 'INSERT') {
              const newNotif = payload.new as Notification;
              console.log('[Realtime Notifications] Adding notification:', newNotif.id);
              onNotificationAdded(newNotif);
              toast({ title: newNotif.title, description: newNotif.message });
            }

            if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Notification;
              console.log('[Realtime Notifications] Updating notification:', updated.id);
              onNotificationUpdated(updated);
            }

            if (payload.eventType === 'DELETE') {
              const oldId = (payload.old as Notification).id;
              console.log('[Realtime Notifications] Deleting notification:', oldId);
              onNotificationDeleted(oldId);
            }
          }
        )
        .subscribe((status: string, err: any) => {
          console.log('[Realtime Notifications] Channel subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('[Realtime Notifications] Successfully subscribed to real-time updates');
          }
          if (status === 'CHANNEL_ERROR') {
            console.error('[Realtime Notifications] Subscription error:', err);
            supabase.removeChannel(channel);
            if (channelRef.current === channel) {
              channelRef.current = null;
            }
          }
        });

      if (isMounted) channelRef.current = channel;
    };

    setupChannel();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        console.log('[Realtime Notifications] Cleanup on effect cleanup');
        cleanupPromiseRef.current = supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id]);
};
