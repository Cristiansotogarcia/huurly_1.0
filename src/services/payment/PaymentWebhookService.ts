
import { supabase } from '../../integrations/supabase/client.ts';
import { DatabaseService, DatabaseResponse } from '../../lib/database.ts';
import { ErrorHandler } from '../../lib/errors.ts';
import { PaymentRecord } from './PaymentRecordService';


export class PaymentWebhookService extends DatabaseService {
  async handlePaymentSuccess(sessionId: string): Promise<DatabaseResponse<PaymentRecord>> {
    console.log(`[PaymentWebhookService] Handling payment success for session: ${sessionId}`);
    return this.executeQuery(async () => {
      // Retrieve session details from our secure Supabase function
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke('get-stripe-session', {
        body: { session_id: sessionId },
      });

      if (sessionError || !sessionData || !sessionData.session) {
        console.error('[PaymentWebhookService] Error invoking get-stripe-session function:', sessionError);
        throw new Error('Kon de betalingsessie niet verifiëren.');
      }

      const session = sessionData.session;

      const userId = session.metadata?.user_id;
      if (!userId) {
        throw new Error('Gebruiker ID niet gevonden in sessie metadata.');
      }

      const subscription = session.subscription as any;
      if (!subscription || !subscription.id) {
        throw new Error('Abonnement ID niet gevonden in sessie.');
      }

      // Upsert abonnement record
      const { data, error } = await supabase
        .from('abonnementen')
        .upsert({
          huurder_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_sessie_id: sessionId,
          status: 'actief',
          start_datum: new Date(subscription.current_period_start * 1000).toISOString(),
          eind_datum: new Date(subscription.current_period_end * 1000).toISOString(),
          bedrag: session.amount_total,
          currency: session.currency,
        }, { onConflict: 'stripe_subscription_id' })
        .select()
        .single();

      if (error) {
        console.error('[PaymentWebhookService] Error upserting subscription:', error);
        throw ErrorHandler.handleDatabaseError(error);
      }

      console.log('[PaymentWebhookService] Subscription successfully upserted:', data);
      await this.createAuditLog('PAYMENT_SUCCESS', 'abonnementen', data.id, null, data);

      return { data, error: null };
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
