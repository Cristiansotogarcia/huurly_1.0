
import { supabase } from '../../integrations/supabase/client.ts';
import { getStripe, SUBSCRIPTION_PLANS } from '../../lib/stripe.ts';
import { DatabaseService, DatabaseResponse } from '../../lib/database.ts';
import { ErrorHandler } from '../../lib/errors.ts';
import { paymentRecordService } from './PaymentRecordService.ts';
import { logger } from '../../lib/logger.ts';

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
          throw new Error('Stripe niet beschikbaar');
        }

        // Check if we're in a development environment (client-side only)
        if (typeof window !== 'undefined') {
          const isDevelopment = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1' ||
                               window.location.protocol === 'http:';
          
          if (isDevelopment) {
            logger.warn('Stripe is running in development mode over HTTP. Production should use HTTPS.');
          }
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Gebruiker niet gevonden');
        }

        // Create payment record with proper validation
        const paymentRecord = await paymentRecordService.createPaymentRecord({
          gebruiker_id: userId,
          gebruiker_type: 'huurder',
          email: user.email || '',
          bedrag: Math.round(plan.priceWithTax * 100),
          status: 'pending',
          aangemaakt_op: new Date().toISOString(),
          bijgewerkt_op: new Date().toISOString()
        });

        // Determine protocol for success/cancel URLs (client-side only)
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

        return { data: { url: data.url }, error: null };
      } catch (error) {
        logger.error('Error creating checkout session:', error);
        throw error;
      }
    });
  }
}

export const stripeCheckoutService = new StripeCheckoutService();
