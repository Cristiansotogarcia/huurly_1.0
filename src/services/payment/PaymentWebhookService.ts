
import { supabase } from '../../integrations/supabase/client.ts';
import { DatabaseService, DatabaseResponse } from '../../lib/database.ts';
import { ErrorHandler } from '../../lib/errors.ts';
import { PaymentRecord } from './PaymentRecordService';


export class PaymentWebhookService extends DatabaseService {
  async handlePaymentSuccess(sessionId: string): Promise<DatabaseResponse<PaymentRecord>> {
    const MAX_RETRIES = 5;
    const INITIAL_DELAY = 2000; // 2 seconds

    for (let i = 0; i < MAX_RETRIES; i++) {
      const result = await this.executeQuery(async () => {
        const { data: existingSubscription, error: findError } = await supabase
          .from('abonnementen')
          .select('*')
          .eq('stripe_sessie_id', sessionId)
          .single();

        if (findError && findError.code !== 'PGRST116') {
          console.error('[PaymentWebhookService] Error finding subscription:', findError);
          throw ErrorHandler.handleDatabaseError(findError);
        }

        if (existingSubscription) {
          if (existingSubscription.status === 'actief') {
            return { data: existingSubscription, error: null };
          } else {
            // Update existing record to active
            const { data, error } = await supabase
              .from('abonnementen')
              .update({
                status: 'actief',
                bijgewerkt_op: new Date().toISOString(),
              })
              .eq('stripe_sessie_id', sessionId)
              .select()
              .single();

            if (error) {
              console.error('[PaymentWebhookService] Error updating subscription:', error);
              throw ErrorHandler.handleDatabaseError(error);
            }

            await this.createAuditLog('PAYMENT_SUCCESS', 'abonnementen', data.id, null, data);

            // Create success notification
            await supabase.from('notificaties').insert({
              gebruiker_id: data.huurder_id,
              type: 'systeem',
              titel: 'Betaling succesvol',
              inhoud: 'Je jaarlijkse abonnement is geactiveerd. Je hebt nu toegang tot alle functies van Huurly.',
              gelezen: false,
            });

            return { data, error: null };
          }
        }

        // Not found yet
        return { data: null, error: null };
      });

      // Check if we found and processed the subscription
      if (result.success && result.data) {
        return result;
      }

      // If not found, wait and retry
      if (i < MAX_RETRIES - 1) {
        const delay = INITIAL_DELAY * Math.pow(2, i);
        await new Promise(res => setTimeout(res, delay));
      }
    }

    // If loop finishes, it means we never found the subscription
    console.error(`[PaymentWebhookService] Final attempt failed for session: ${sessionId}`);
    return {
      data: null,
      error: new Error('Geen abonnement gevonden voor deze betalingssessie. De webhook heeft mogelijk gefaald.'),
      success: false,
    };
  }

  async handlePaymentFailure(sessionId: string): Promise<DatabaseResponse<PaymentRecord>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('abonnementen')
        .update({ 
          status: 'geannuleerd',
          bijgewerkt_op: new Date().toISOString()
        })
        .eq('stripe_sessie_id', sessionId)
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      await this.createAuditLog('PAYMENT_FAILED', 'abonnementen', data.id, null, data);

      return { data, error: null };
    });
  }
}

export const paymentWebhookService = new PaymentWebhookService();
