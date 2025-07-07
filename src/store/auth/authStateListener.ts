
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const createAuthStateListener = (set: any) => {
  return () => {
    // Set up auth state listener without async operations inside
    supabase.auth.onAuthStateChange((event, session) => {
      logger.info('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Use setTimeout to defer the async operation
        setTimeout(async () => {
          const user = await authService.mapSupabaseUserToUser(session.user);
          set({ 
            user, 
            isAuthenticated: true, 
            sessionValid: true,
            lastSessionCheck: Date.now()
          });
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        set({ 
          user: null, 
          isAuthenticated: false, 
          sessionValid: false,
          isRefreshing: false,
          lastSessionCheck: 0
        });
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Use setTimeout to defer the async operation
        setTimeout(async () => {
          const user = await authService.mapSupabaseUserToUser(session.user);
          set({ 
            user, 
            isAuthenticated: true, 
            sessionValid: true,
            lastSessionCheck: Date.now()
          });
        }, 0);
      }
    });
  };
};
