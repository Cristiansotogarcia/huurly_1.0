
import { supabase } from '../../integrations/supabase/client.ts';
import { logger } from '../logger.ts';

class PaymentChecker {
  /**
   * Check if user has valid payment/subscription
   */
  async checkPaymentStatus(userId: string): Promise<boolean> {
    try {
      // Check subscription status from abonnementen table using Dutch field names
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('abonnementen')
        .select('status')
        .eq('huurder_id', userId)
        .eq('status', 'actief')
        .single();

      if (subscriptionError) {
        logger.error('Error checking subscription status:', subscriptionError);
        return false;
      }

      // Check if subscription is active using Dutch status value
      return subscriptionData?.status === 'actief';
    } catch (error) {
      logger.error('Error checking payment status:', error);
      return false;
    }
  }
}

export const paymentChecker = new PaymentChecker();
