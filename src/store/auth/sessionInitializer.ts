
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const initializeSession = async (set: any) => {
  try {
    logger.info('Initializing authentication...');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      logger.error('Auth initialization error:', error);
      set({ 
        user: null, 
        isAuthenticated: false, 
        sessionValid: false,
        lastSessionCheck: Date.now()
      });
      return;
    }

    if (session?.user) {
      const user = await authService.mapSupabaseUserToUser(session.user);
      set({ 
        user, 
        isAuthenticated: true, 
        sessionValid: true,
        lastSessionCheck: Date.now()
      });
      logger.info('Authentication initialized with existing session');
    } else {
      set({ 
        user: null, 
        isAuthenticated: false, 
        sessionValid: false,
        lastSessionCheck: Date.now()
      });
      logger.info('No existing session found');
    }
  } catch (error) {
    logger.error('Auth initialization failed:', error);
    set({ 
      user: null, 
      isAuthenticated: false, 
      sessionValid: false,
      lastSessionCheck: Date.now()
    });
  }
};
