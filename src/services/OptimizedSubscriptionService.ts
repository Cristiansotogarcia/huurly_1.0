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

      try {
        const { data, error } = await supabase
          .from('abonnementen')
          .select('*')
          .eq('huurder_id', userId)
          .eq('status', 'actief')
          .order('bijgewerkt_op', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          logger.error('Error checking subscription status:', error);
          return { 
            data: { hasActiveSubscription: false, isActive: false }, 
            error: null 
          };
        }

        // Cache the result
        this.setCachedSubscription(userId, data);

        return this.formatSubscriptionResponse(data);
      } catch (error) {
        logger.error('Unexpected error in checkSubscriptionStatus:', error);
        return { 
          data: { hasActiveSubscription: false, isActive: false }, 
          error: null 
        };
      }
    });
  }

  /**
   * Clear subscription cache for a user (call after payment success)
   */
  clearSubscriptionCache(userId: string): void {
    this.cache.delete(userId);
    logger.debug('Cleared subscription cache for user:', userId);
  }

  /**
   * Refresh subscription status and update cache
   */
  async refreshSubscriptionStatus(userId: string): Promise<DatabaseResponse<SubscriptionStatus>> {
    this.clearSubscriptionCache(userId);
    return this.checkSubscriptionStatus(userId);
  }

  /**
   * Get subscription expiration info with caching
   */
  async getSubscriptionExpiration(userId: string): Promise<DatabaseResponse<{ expiresAt: string | null; daysRemaining: number | null }>> {
    return this.executeQuery(async () => {
      const result = await this.checkSubscriptionStatus(userId);
      
      if (result.success && result.data?.expiresAt) {
        const expiresAt = result.data.expiresAt;
        const expirationDate = new Date(expiresAt);
        const today = new Date();
        const daysRemaining = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          data: {
            expiresAt,
            daysRemaining: daysRemaining > 0 ? daysRemaining : 0
          },
          error: null
        };
      }

      return {
        data: {
          expiresAt: null,
          daysRemaining: null
        },
        error: null
      };
    });
  }

  /**
   * Check if subscription is expiring soon (within 2 weeks)
   */
  async isSubscriptionExpiringSoon(userId: string): Promise<boolean> {
    try {
      const result = await this.getSubscriptionExpiration(userId);
      if (result.success && result.data?.daysRemaining !== null) {
        return result.data.daysRemaining <= 14;
      }
      return false;
    } catch (error) {
      logger.error('Error checking subscription expiration:', error);
      return false;
    }
  }

  /**
   * Batch check subscription statuses for multiple users (admin use)
   */
  async batchCheckSubscriptions(userIds: string[]): Promise<Map<string, SubscriptionStatus>> {
    const results = new Map<string, SubscriptionStatus>();
    
    try {
      const { data, error } = await supabase
        .from('abonnementen')
        .select('huurder_id, status, eind_datum, stripe_subscription_id')
        .in('huurder_id', userIds)
        .eq('status', 'actief');

      if (error) {
        logger.error('Error in batch subscription check:', error);
        return results;
      }

      // Process results
      const activeSubscriptions = new Map();
      data?.forEach(sub => {
        activeSubscriptions.set(sub.huurder_id, sub);
      });

      // Format results for all requested users
      userIds.forEach(userId => {
        const subscription = activeSubscriptions.get(userId);
        results.set(userId, this.formatSubscriptionResponse(subscription).data!);
      });

      return results;
    } catch (error) {
      logger.error('Error in batch subscription check:', error);
      return results;
    }
  }

  /**
   * Get cached subscription if valid
   */
  private getCachedSubscription(userId: string): any | null {
    const cached = this.cache.get(userId);
    if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
      return cached.subscription;
    }
    
    // Remove expired cache
    if (cached) {
      this.cache.delete(userId);
    }
    
    return null;
  }

  /**
   * Set subscription in cache
   */
  private setCachedSubscription(userId: string, subscription: any): void {
    this.cache.set(userId, {
      subscription,
      timestamp: Date.now(),
      userId
    });
  }

  /**
   * Format subscription response consistently
   */
  private formatSubscriptionResponse(subscription: any): DatabaseResponse<SubscriptionStatus> {
    const hasActiveSubscription = !!subscription;
    
    return {
      data: {
        hasActiveSubscription,
        isActive: hasActiveSubscription,
        subscriptionType: hasActiveSubscription ? 'yearly' : undefined,
        expiresAt: hasActiveSubscription ? subscription.eind_datum : undefined,
        stripeSubscriptionId: hasActiveSubscription ? subscription.stripe_subscription_id : undefined,
      },
      error: null
    };
  }

  /**
   * Clean expired cache entries (call periodically)
   */
  cleanCache(): void {
    const now = Date.now();
    for (const [userId, cached] of this.cache.entries()) {
      if (now - cached.timestamp >= this.CACHE_TTL) {
        this.cache.delete(userId);
      }
    }
  }
}

export const optimizedSubscriptionService = new OptimizedSubscriptionService();

// Clean cache every 10 minutes
setInterval(() => {
  optimizedSubscriptionService.cleanCache();
}, 10 * 60 * 1000);