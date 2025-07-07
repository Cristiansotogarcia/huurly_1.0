
import { supabase } from '../../integrations/supabase/client.ts';
import { DatabaseService, DatabaseResponse } from '../../lib/database.ts';
import { ErrorHandler } from '../../lib/errors.ts';
import { PaymentRecord } from './PaymentRecordService';

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionType?: string;
  expiresAt?: string;
  stripeSubscriptionId?: string;
}

export class SubscriptionService extends DatabaseService {
  async checkSubscriptionStatus(userId: string): Promise<DatabaseResponse<SubscriptionStatus>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('abonnementen')
        .select('*')
        .eq('huurder_id', userId)
        .eq('status', 'actief')
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
          expiresAt: hasActiveSubscription ? data[0].eind_datum : undefined,
          stripeSubscriptionId: hasActiveSubscription ? data[0].stripe_subscription_id : undefined,
        } as SubscriptionStatus,
        error: null,
      };
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<DatabaseResponse<any>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'cancel', subscriptionId }
      });
      return { data, error };
    });
  }

  async renewSubscription(subscriptionId: string): Promise<DatabaseResponse<any>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'resume', subscriptionId }
      });
      return { data, error };
    });
  }
}

export const subscriptionService = new SubscriptionService();
