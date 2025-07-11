
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const createSessionManager = (set: any, get: any) => ({
  validateSession: async (): Promise<boolean> => {
    const state = get();
    
    // Skip cache if user is returning from payment flow
    const isReturningFromPayment = window.location.search.includes('payment_success') || 
                                   window.location.search.includes('payment_canceled') ||
                                   state.isInPaymentFlow;
    
    // Use longer cache time to reduce validation frequency
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    if (state.sessionValid && state.lastSessionCheck > tenMinutesAgo && !isReturningFromPayment && !state.isRefreshing) {
      return true;
    }

    try {
      logger.info('Validating user session...', { isReturningFromPayment });
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('Session validation error:', error);
        set({ sessionValid: false, lastSessionCheck: Date.now() });
        return false;
      }

      if (!session) {
        logger.warn('No active session found');
        set({ sessionValid: false, lastSessionCheck: Date.now() });
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        logger.warn('Session has expired');
        set({ sessionValid: false, lastSessionCheck: Date.now() });
        return false;
      }

      set({ sessionValid: true, lastSessionCheck: Date.now() });
      
      if (session.user && (!state.user || state.user.id !== session.user.id)) {
        const user = await authService.mapSupabaseUserToUser(session.user);
        set({ user, isAuthenticated: true });
        logger.info('Session validated and user updated');
      }

      return true;
    } catch (error) {
      logger.error('Session validation failed:', error);
      set({ sessionValid: false, lastSessionCheck: Date.now() });
      return false;
    }
  },

  refreshSession: async (): Promise<boolean> => {
    const state = get();
    
    if (state.isRefreshing) {
      // Wait for the current refresh to complete using a more efficient approach
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const currentState = get();
        if (!currentState.isRefreshing) {
          return currentState.sessionValid;
        }
        attempts++;
      }
      
      // If still refreshing after max attempts, return current state
      logger.warn('Session refresh timeout reached');
      return get().sessionValid;
    }

    set({ isRefreshing: true });

    try {
      logger.info('Refreshing user session...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        logger.error('Session refresh error:', error);
        set({ 
          sessionValid: false, 
          isRefreshing: false,
          lastSessionCheck: Date.now()
        });
        return false;
      }

      if (!data.session) {
        logger.warn('No session returned from refresh');
        set({ 
          sessionValid: false, 
          isRefreshing: false,
          lastSessionCheck: Date.now()
        });
        return false;
      }

      const user = await authService.mapSupabaseUserToUser(data.session.user);
      set({ 
        user,
        isAuthenticated: true,
        sessionValid: true, 
        isRefreshing: false,
        lastSessionCheck: Date.now()
      });

      logger.info('Session refreshed successfully');
      return true;
    } catch (error) {
      logger.error('Session refresh failed:', error);
      set({ 
        sessionValid: false, 
        isRefreshing: false,
        lastSessionCheck: Date.now()
      });
      return false;
    }
  },
});
