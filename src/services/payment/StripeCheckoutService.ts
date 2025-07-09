
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
        const plan = SUBSCRIPTION_PLANS.huurder.halfyearly;
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
          logger.error('Fout bij het aanroepen van create-checkout-session functie:', {
            error,
            message: error.message,
            details: error.details,
            context: error.context
          });
          
          // Provide more specific error messages based on the error
          if (error.message?.includes('environment variables')) {
            throw new Error('Betalingsconfiguratie ontbreekt. Neem contact op met de beheerder.');
          } else if (error.message?.includes('Price ID')) {
            throw new Error('Ongeldige prijsconfiguratie. Neem contact op met de beheerder.');
          } else if (error.message?.includes('network')) {
            throw new Error('Netwerkfout. Controleer uw internetverbinding en probeer het opnieuw.');
          } else {
            throw new Error('Het is niet gelukt om een beveiligde betaalsessie aan te maken. Probeer het later opnieuw.');
          }
        }

        if (!data?.url) {
          logger.error('Geen checkout-URL ontvangen van create-checkout-session', {
            data,
            hasData: !!data,
            dataKeys: data ? Object.keys(data) : []
          });
          throw new Error('Geen betaallink ontvangen. Probeer het opnieuw of neem contact op met de beheerder.');
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
