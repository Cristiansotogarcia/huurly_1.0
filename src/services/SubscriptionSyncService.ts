import { supabase } from '../integrations/supabase/client';
import { logger } from '../lib/logger';

/**
 * Service to sync subscription status with Stripe
 * This can be used as a fallback when webhooks fail
 */
export class SubscriptionSyncService {
  /**
   * Check for pending subscriptions and attempt to sync with Stripe
   */
  static async syncPendingSubscriptions(userId: string): Promise<boolean> {
    try {
      // Get pending subscriptions for the user
      const { data: pendingSubscriptions, error } = await supabase
        .from('abonnementen')
        .select('*')
        .eq('huurder_id', userId)
        .eq('status', 'wachtend')
        .order('aangemaakt_op', { ascending: false });

      if (error) {
        logger.error('Failed to fetch pending subscriptions:', error);
        return false;
      }

      if (!pendingSubscriptions || pendingSubscriptions.length === 0) {
        logger.info('No pending subscriptions found for user:', userId);
        return false;
      }

      logger.info(`Found ${pendingSubscriptions.length} pending subscription(s) for user:`, userId);

      // For each pending subscription, check if we can verify it with Stripe
      for (const subscription of pendingSubscriptions) {
        if (subscription.stripe_subscription_id) {
          logger.info('Found pending subscription with Stripe ID:', subscription.stripe_subscription_id);
          // In a real implementation, you would call Stripe API here
          // For now, we'll just log this for debugging
          console.warn('⚠️ MANUAL ACTION NEEDED: Check Stripe subscription status for:', subscription.stripe_subscription_id);
        }
      }

      return true;
    } catch (error) {
      logger.error('Error syncing pending subscriptions:', error);
      return false;
    }
  }

  /**
   * Log subscription status for debugging
   */
  static async debugSubscriptionStatus(userId: string): Promise<void> {
    try {
      const { data: allSubscriptions, error } = await supabase
        .from('abonnementen')
        .select('*')
        .eq('huurder_id', userId)
        .order('aangemaakt_op', { ascending: false });

      if (error) {
        console.error('Failed to fetch subscriptions for debugging:', error);
        return;
      }

      console.log('🔍 DEBUG: All subscriptions for user', userId, ':', allSubscriptions);
      
      if (allSubscriptions && allSubscriptions.length > 0) {
        allSubscriptions.forEach((sub, index) => {
          console.log(`📋 Subscription ${index + 1}:`, {
            id: sub.id,
            status: sub.status,
            stripe_subscription_id: sub.stripe_subscription_id,
            stripe_sessie_id: sub.stripe_sessie_id,
            created: sub.aangemaakt_op,
            updated: sub.bijgewerkt_op
          });
        });
      } else {
        console.log('❌ No subscriptions found for user:', userId);
      }
    } catch (error) {
      console.error('Error debugging subscription status:', error);
    }
  }
}

export const subscriptionSyncService = new SubscriptionSyncService();