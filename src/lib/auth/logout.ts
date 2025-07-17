import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface LogoutOptions {
  redirectTo?: string;
  clearAllStorage?: boolean;
  showToast?: boolean;
}

export class LogoutService {
  /**
   * Comprehensive logout implementation based on aruba project
   */
  static async performLogout(options: LogoutOptions = {}): Promise<{ success: boolean; error?: Error }> {
    const {
      redirectTo = '/',
      clearAllStorage = true,
      showToast = true
    } = options;

    try {
      logger.info('Performing comprehensive logout...');

      // 1. Clear all session storage items (similar to aruba project)
      if (typeof window !== 'undefined' && clearAllStorage) {
        this.clearAllStorage();
      }

      // 2. Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Supabase signout error:', error);
        return { success: false, error };
      }

      // 3. Clear any auth-related cookies
      this.clearAuthCookies();

      // 4. Clear any remaining auth state
      this.clearAuthState();

      logger.info('Logout completed successfully');
      return { success: true };

    } catch (error) {
      logger.error('Logout error:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Clear all storage items similar to aruba project
   */
  private static clearAllStorage(): void {
    if (typeof window === 'undefined') return;

    // Session storage cleanup
    const sessionKeys = [
      'admin:activeSection',
      'auth:lastActivity',
      'dashboard:selectedTab',
      'dashboard:filters',
      'user:preferences',
      'search:filters',
      'notifications:lastRead',
      'profile:cache',
      'property:cache',
      'messages:cache',
      'subscription:cache'
    ];

    sessionKeys.forEach(key => sessionStorage.removeItem(key));

    // Local storage cleanup
    const localKeys = [
      'auth-storage',
      'supabase.auth.token',
      'supabase.auth.refreshToken',
      'supabase.auth.expiresAt',
      'user:settings',
      'theme:preference',
      'language:preference'
    ];

    localKeys.forEach(key => localStorage.removeItem(key));

    // Clear any auth-related cookies
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      if (name.includes('auth') || name.includes('session') || name.includes('token')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    });
  }

  /**
   * Clear auth-related cookies
   */
  private static clearAuthCookies(): void {
    if (typeof window === 'undefined') return;

    const authCookies = ['auth-token', 'refresh-token', 'session-id', 'user-id'];
    authCookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
    });
  }

  /**
   * Clear any remaining auth state
   */
  private static clearAuthState(): void {
    if (typeof window === 'undefined') return;

    // Clear any URL parameters that might contain auth tokens
    if (window.location.hash.includes('access_token') || 
        window.location.hash.includes('type=recovery') ||
        window.location.hash.includes('refresh_token')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Clear query parameters
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  /**
   * Handle beforeunload cleanup (for tab close)
   */
  static setupBeforeUnloadCleanup(): () => void {
    if (typeof window === 'undefined') return () => {};

    const handleBeforeUnload = () => {
      // Perform minimal cleanup on tab close
      sessionStorage.removeItem('auth:lastActivity');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Return cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }
}

// Export singleton instance
export const logoutService = LogoutService;
