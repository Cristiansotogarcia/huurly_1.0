
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

class PaymentChecker {
  /**
   * Check if user has valid payment/subscription
   */
  async checkPaymentStatus(userId: string): Promise<boolean> {
    try {
      // Check subscription status from abonnementen table instead
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('abonnementen')
        .select('status')
        .eq('huurder_id', userId)
        .eq('status', 'active')
        .single();

      if (subscriptionError) {
        logger.error('Error checking subscription status:', subscriptionError);
        return false;
      }

      // Check if subscription is active
      return subscriptionData?.status === 'active';
    } catch (error) {
      logger.error('Error checking payment status:', error);
      return false;
    }
  }
}

export const paymentChecker = new PaymentChecker();
