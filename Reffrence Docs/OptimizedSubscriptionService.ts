import { supabase } from '../integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '../lib/database';
import { logger } from '../lib/logger';

interface CachedSubscription {
  subscription: any;
  timestamp: number;
  userId: string;
}

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  isActive: boolean;
  subscriptionType?: string;
  expiresAt?: string;
  stripeSubscriptionId?: string;
}

class OptimizedSubscriptionService extends DatabaseService {
  private cache = new Map<string, CachedSubscription>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

  /**
   * Check subscription status with intelligent caching
   */
  async checkSubscriptionStatus(userId: string): Promise<DatabaseResponse<SubscriptionStatus>> {
    return this.executeQuery(async () => {
      // Check cache first
      const cached = this.getCachedSubscription(userId);
      if (cached) {
        logger.debug('Returning cached subscription status for user:', userId);
        return this.formatSubscriptionResponse(cached);
      }

      // Validate session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { 
          data: { hasActiveSubscription: false, isActive: false }, 
          error: null 
        };
      }

      // Security check
      if (session.user.id !== userId) {
        return { 
          data: { hasActiveSubscription: false, isActive: false }, 
          error: new Error('Unauthorized') 
        };
      }