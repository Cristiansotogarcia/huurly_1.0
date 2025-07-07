
import { supabase } from '../../integrations/supabase/client.ts';
import { DatabaseService, DatabaseResponse } from '../../lib/database.ts';
import { ErrorHandler } from '../../lib/errors.ts';
import { PaymentRecord } from './PaymentRecordService';


export class PaymentWebhookService extends DatabaseService {
  async handlePaymentSuccess(sessionId: string): Promise<DatabaseResponse<PaymentRecord>> {
    console.log(`[PaymentWebhookService] Handling payment success for session: ${sessionId}`);
    return this.executeQuery(async () => {
      // Simply mark existing subscription as successful
      // The webhook already has all the data we need, so we don't need to call Stripe again
      
      const { data: existingSubscription, error: findError } = await supabase
        .from('abonnementen')
        .select('*')
        .eq('stripe_sessie_id', sessionId)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        console.error('[PaymentWebhookService] Error finding subscription:', findError);
        throw ErrorHandler.handleDatabaseError(findError);
      }

      if (existingSubscription && existingSubscription.status === 'actief') {
        console.log('[PaymentWebhookService] Payment already processed for session:', sessionId);
        return { data: existingSubscription, error: null };
      }

      if (existingSubscription) {
        // Update existing record to active
        const { data, error } = await supabase
          .from('abonnementen')
          .update({ 
            status: 'actief',
            bijgewerkt_op: new Date().toISOString()
          })
          .eq('stripe_sessie_id', sessionId)
          .select()
          .single();

        if (error) {
          console.error('[PaymentWebhookService] Error updating subscription:', error);
          throw ErrorHandler.handleDatabaseError(error);
        }

        console.log('[PaymentWebhookService] Subscription successfully updated to active:', data);
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
      } else {
        // No existing record found - webhook should have created it
        console.error('[PaymentWebhookService] No subscription record found for session:', sessionId);
        throw new Error('Geen abonnement gevonden voor deze betalingssessie. De webhook heeft mogelijk gefaald.');
      }
    });
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
