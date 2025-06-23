
import { supabase } from '../../integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '../../lib/database';
import { ErrorHandler } from '../../lib/errors';
import { PaymentRecord } from './PaymentRecordService';

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionType?: string;
  expiresAt?: string;
}

export class SubscriptionService extends DatabaseService {
  async checkSubscriptionStatus(userId: string): Promise<DatabaseResponse<SubscriptionStatus>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('betalingen')
        .select('*')
        .eq('gebruiker_id', userId)
        .eq('status', 'completed')
        .order('bijgewerkt_op', { ascending: false })
        .limit(1);

      if (error) {
        return { data: null, error };
      }

      const hasActiveSubscription = data && data.length > 0;

      return {
        data: {
          hasActiveSubscription,
          subscriptionType: hasActiveSubscription ? 'yearly' : undefined,
          expiresAt: hasActiveSubscription ? 
            new Date(new Date(data[0].bijgewerkt_op).setFullYear(new Date(data[0].bijgewerkt_op).getFullYear() + 1)).toISOString() : 
            undefined,
        } as SubscriptionStatus,
        error: null,
      };
    });
  }
}

export const subscriptionService = new SubscriptionService();
