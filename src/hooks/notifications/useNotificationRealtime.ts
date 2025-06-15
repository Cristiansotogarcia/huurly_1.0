
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
  // Stores the channel object
  const channelRef = useRef<any>(null);
  // Used to await removal if in progress
  const cleanupPromiseRef = useRef<Promise<any> | null>(null);
  // Store the latest callback handlers
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

      // If a channel already exists, clean it up first AND only after that's done make a new one
      if (channelRef.current) {
        console.log('[Realtime Notifications] Existing channel found, cleaning up before creating new one');
        cleanupPromiseRef.current = supabase.removeChannel(channelRef.current);
        await cleanupPromiseRef.current;
        if (isMounted) channelRef.current = null;
        cleanupPromiseRef.current = null;
      }

      // Defensive guard: If another cleanup is in progress, wait for it before creating a channel
      if (cleanupPromiseRef.current) {
        console.log('[Realtime Notifications] Awaiting previous cleanup before setting up new channel');
        await cleanupPromiseRef.current;
        cleanupPromiseRef.current = null;
      }

      // Now safely create a new channel and subscribe ONLY ONCE for this user id
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
            console.log('[Realtime Notifications] Event:', payload.eventType, payload);

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
          console.log('[Realtime Notifications] Channel subscription status:', status);
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

    // Cleanup function for when component unmounts or user id changes
    return () => {
      isMounted = false;
      if (channelRef.current) {
        console.log('[Realtime Notifications] Cleanup on effect cleanup');
        cleanupPromiseRef.current = supabase.removeChannel(channelRef.current);
        // Not awaited here since we are unmounting, but next mount will wait for existing cleanup!
        channelRef.current = null;
      }
    };
    // Only re-run if the actual user id changes
  }, [user?.id]);
};
