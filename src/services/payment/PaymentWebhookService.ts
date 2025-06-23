
import { supabase } from '../../integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '../../lib/database';
import { ErrorHandler } from '../../lib/errors';
import { PaymentRecord } from './PaymentRecordService';

export class PaymentWebhookService extends DatabaseService {
  async handlePaymentSuccess(sessionId: string): Promise<DatabaseResponse<PaymentRecord>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('betalingen')
        .update({ 
          status: 'completed',
          bijgewerkt_op: new Date().toISOString()
        })
        .eq('stripe_sessie_id', sessionId)
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      await this.createAuditLog('PAYMENT_SUCCESS', 'betalingen', data.id, null, data);

      return { data, error: null };
    });
  }

  async handlePaymentFailure(sessionId: string): Promise<DatabaseResponse<PaymentRecord>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('betalingen')
        .update({ 
          status: 'failed',
          bijgewerkt_op: new Date().toISOString()
        })
        .eq('stripe_sessie_id', sessionId)
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      await this.createAuditLog('PAYMENT_FAILED', 'betalingen', data.id, null, data);

      return { data, error: null };
    });
  }
}

export const paymentWebhookService = new PaymentWebhookService();
