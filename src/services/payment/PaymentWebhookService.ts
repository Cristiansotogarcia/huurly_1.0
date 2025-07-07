
import { supabase } from '../../integrations/supabase/client.ts';
import { DatabaseService, DatabaseResponse } from '../../lib/database.ts';
import { ErrorHandler } from '../../lib/errors.ts';
import { PaymentRecord } from './PaymentRecordService';


export class PaymentWebhookService extends DatabaseService {
  async handlePaymentSuccess(sessionId: string): Promise<DatabaseResponse<PaymentRecord>> {
    console.log(`[PaymentWebhookService] Handling payment success for session: ${sessionId}`);
    return this.executeQuery(async () => {
      // First check if we already have a subscription for this session
      const { data: existingSubscription } = await supabase
        .from('abonnementen')
        .select('*')
        .eq('stripe_sessie_id', sessionId)
        .single();

      if (existingSubscription) {
        console.log('[PaymentWebhookService] Payment already processed for session:', sessionId);
        return { data: existingSubscription, error: null };
      }

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
      const subscriptionData = {
        huurder_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        stripe_sessie_id: sessionId,
        status: 'actief',
        start_datum: new Date(subscription.current_period_start * 1000).toISOString(),
        eind_datum: new Date(subscription.current_period_end * 1000).toISOString(),
        bedrag: session.amount_total,
        currency: session.currency,
      };

      const { data, error } = await supabase
        .from('abonnementen')
        .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' })
        .select()
        .single();

      if (error) {
        console.error('[PaymentWebhookService] Error upserting subscription:', error);
        throw ErrorHandler.handleDatabaseError(error);
      }

      console.log('[PaymentWebhookService] Subscription successfully upserted:', data);
      await this.createAuditLog('PAYMENT_SUCCESS', 'abonnementen', data.id, null, data);

      // Create success notification
      await supabase.from('notificaties').insert({
        gebruiker_id: userId,
        type: 'systeem',
        titel: 'Betaling succesvol',
        inhoud: 'Je jaarlijkse abonnement is geactiveerd. Je hebt nu toegang tot alle functies van Huurly.',
        gelezen: false,
      });

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
