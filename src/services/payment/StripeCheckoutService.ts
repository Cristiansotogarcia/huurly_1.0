
import { supabase } from '../../integrations/supabase/client';
import { getStripe, SUBSCRIPTION_PLANS } from '../../lib/stripe-config';
import { DatabaseService, DatabaseResponse } from '../../lib/database';
import { ErrorHandler } from '../../lib/errors';
import { paymentRecordService } from './PaymentRecordService';
import { logger } from '../../lib/logger';

export class StripeCheckoutService extends DatabaseService {
  async createCheckoutSession(userId: string, baseUrl: string): Promise<DatabaseResponse<{ url: string }>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId || currentUserId !== userId) {
      return {
        data: null,
        error: ErrorHandler.normalize('U bent niet geautoriseerd om deze actie uit te voeren.'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      try {
        const plan = SUBSCRIPTION_PLANS.huurder.yearly;
        const stripe = await getStripe();
        
        if (!stripe) {
          throw new Error('Betalingsverwerker is momenteel niet beschikbaar. Probeer het later opnieuw.');
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Gebruiker niet gevonden. Log opnieuw in en probeer het nogmaals.');
        }

        logger.info('Sessie aanmaken voor gebruiker:', { userId, email: user.email });

        const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${baseUrl}/huurder-dashboard?payment=cancelled`;

        // Create checkout session directly without pre-creating record
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: {
            priceId: plan.priceId,
            userId: userId,
            userEmail: user.email,
            successUrl,
            cancelUrl,
          },
        });
        
        if (error) {
          logger.error('Fout bij het aanroepen van create-checkout-session functie:', error);
          throw new Error('Het is niet gelukt om een beveiligde betaalsessie aan te maken. Controleer uw verbinding en probeer het opnieuw.');
        }

        if (!data?.url) {
          logger.error('Geen checkout-URL ontvangen van create-checkout-session');
          throw new Error('Kon de betaalsessie niet verifiëren. Probeer het later opnieuw.');
        }

        logger.info('Checkout-sessie aangemaakt, doorsturen naar Stripe...');

        // Return the URL for redirect instead of using Stripe client-side redirect
        return { data: { url: data.url }, error: null };
      } catch (error) {
        logger.error('Fout bij het aanmaken van de checkout-sessie:', error);
        throw error;
      }
    });
  }
}

export const stripeCheckoutService = new StripeCheckoutService();
