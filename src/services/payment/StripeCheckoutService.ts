
import { supabase } from '../../integrations/supabase/client';
import { getStripe, SUBSCRIPTION_PLANS } from '../../lib/stripe-config';
import { DatabaseService, DatabaseResponse } from '../../lib/database';
import { ErrorHandler } from '../../lib/errors';
import { paymentRecordService } from './PaymentRecordService';
import { logger } from '../../lib/logger';

export class StripeCheckoutService extends DatabaseService {
  async createCheckoutSession(userId: string): Promise<DatabaseResponse<{ url: string }>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId || currentUserId !== userId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      try {
        const plan = SUBSCRIPTION_PLANS.huurder.yearly;
        const stripe = await getStripe();
        
        if (!stripe) {
          throw new Error('Stripe niet beschikbaar - controleer de configuratie');
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Gebruiker niet gevonden');
        }

        logger.info('Creating checkout session for user:', { userId, email: user.email });

        // Create payment record with proper validation
        const paymentRecord = await paymentRecordService.createPaymentRecord({
          huurder_id: userId,
          bedrag: Math.round(plan.priceWithTax * 100),
          status: 'pending',
          start_datum: new Date().toISOString(),
          aangemaakt_op: new Date().toISOString(),
          bijgewerkt_op: new Date().toISOString()
        });

        logger.info('Payment record created:', { paymentRecordId: paymentRecord.id });

        // Determine base URL for success/cancel URLs
        let baseUrl = '';
        if (typeof window !== 'undefined') {
          const protocol = window.location.protocol;
          const host = window.location.host;
          baseUrl = `${protocol}//${host}`;
        }

        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: {
            priceId: plan.priceId,
            userId: userId,
            userEmail: user.email,
            paymentRecordId: paymentRecord.id,
            successUrl: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${baseUrl}/huurder-dashboard?payment=cancelled`,
          },
        });
        
        if (error) {
          logger.error('Error from create-checkout-session function:', error);
          throw new Error('Fout bij het aanmaken van betaling: ' + error.message);
        }

        if (!data?.sessionId) {
          logger.error('No session ID returned from create-checkout-session');
          throw new Error('Geen sessie ID ontvangen van Stripe');
        }

        logger.info('Checkout session created:', { sessionId: data.sessionId });

        // Update payment record with session ID
        await paymentRecordService.updatePaymentRecord(paymentRecord.id, { 
          stripe_session_id: data.sessionId 
        });

        // Redirect to Stripe Checkout
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (stripeError) {
          logger.error('Stripe redirect error:', stripeError);
          throw new Error(stripeError.message);
        }

        return { data: { url: data.url || '' }, error: null };
      } catch (error) {
        logger.error('Error creating checkout session:', error);
        throw error;
      }
    });
  }
}

export const stripeCheckoutService = new StripeCheckoutService();
