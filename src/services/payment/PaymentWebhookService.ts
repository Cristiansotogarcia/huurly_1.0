
import { supabase } from '../../integrations/supabase/client.ts';
import { DatabaseService, DatabaseResponse } from '../../lib/database.ts';
import { ErrorHandler } from '../../lib/errors.ts';
import { PaymentRecord } from './PaymentRecordService';
import { emailService } from '../EmailService';
import paymentConfirmationTemplate from '../../templates/emails/paymentConfirmation.html?raw';

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

      if (data.gebruiker_id && data.email) {
        await emailService.sendTemplateEmail(
          data.gebruiker_id,
          data.email,
          'Betaling bevestigd',
          'paymentConfirmation'
        );
      }

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
