
import { supabase } from '../../integrations/supabase/client.ts';
import { DatabaseService, DatabaseResponse } from '../../lib/database.ts';
import { ErrorHandler } from '../../lib/errors.ts';
<<<<<<< codex/troubleshoot-npm-test-and-network-access-issues
import { PaymentRecord } from './PaymentRecordService.ts';
=======
import { PaymentRecord } from './PaymentRecordService';
>>>>>>> main

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionType?: string;
  expiresAt?: string;
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
        } as SubscriptionStatus,
        error: null,
      };
    });
  }
}

export const subscriptionService = new SubscriptionService();
