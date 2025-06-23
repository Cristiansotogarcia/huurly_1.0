
import { supabase } from '../../integrations/supabase/client';
import { getStripe, SUBSCRIPTION_PLANS } from '../../lib/stripe';
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
      const plan = SUBSCRIPTION_PLANS.huurder.yearly;
      const stripe = await getStripe();
      
      if (!stripe) {
        throw new Error('Stripe niet beschikbaar');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Gebruiker niet gevonden');
      }

      const paymentRecord = await paymentRecordService.createPaymentRecord({
        gebruiker_id: userId,
        gebruiker_type: 'huurder',
        email: user.email || '',
        bedrag: Math.round(plan.priceWithTax * 100),
        status: 'pending',
      });

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: plan.priceId,
          userId: userId,
          userEmail: user.email,
          paymentRecordId: paymentRecord.id,
          successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/huurder-dashboard?payment=cancelled`,
        },
      });

      if (error) {
        throw new Error('Fout bij het aanmaken van betaling: ' + error.message);
      }

      if (!data?.sessionId) {
        throw new Error('Geen sessie ID ontvangen van Stripe');
      }

      await paymentRecordService.updatePaymentRecord(paymentRecord.id, { 
        stripe_sessie_id: data.sessionId 
      });

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      return { 
        data: { url: 'redirecting...' }, 
        error: null 
      };
    });
  }
}

export const stripeCheckoutService = new StripeCheckoutService();
