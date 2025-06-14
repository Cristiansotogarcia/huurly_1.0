
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

class PaymentChecker {
  /**
   * Check if user has valid payment/subscription
   */
  async checkPaymentStatus(userId: string): Promise<boolean> {
    try {
      // Check subscription status from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('subscription_status')
        .eq('user_id', userId)
        .single();

      if (roleError) {
        logger.error('Error checking subscription status:', roleError);
        return false;
      }

      // Check if subscription is active
      return roleData?.subscription_status === 'active';
    } catch (error) {
      logger.error('Error checking payment status:', error);
      return false;
    }
  }
}

export const paymentChecker = new PaymentChecker();
