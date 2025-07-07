
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

        const now = new Date().toISOString();
        const paymentRecord = await paymentRecordService.createPaymentRecord({
          huurder_id: userId,
          bedrag: Math.round(plan.priceWithTax * 100),
          status: 'wachtend',
          start_datum: now,
          aangemaakt_op: now,
          bijgewerkt_op: now
        });

        logger.info('Betaalrecord aangemaakt:', { paymentRecordId: paymentRecord.id });

        const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${baseUrl}/huurder-dashboard?payment=cancelled`;

        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: {
            priceId: plan.priceId,
            userId: userId,
            userEmail: user.email,
            paymentRecordId: paymentRecord.id,
            successUrl,
            cancelUrl,
          },
        });
        
        if (error) {
          logger.error('Fout bij het aanroepen van create-checkout-session functie:', error);
          throw new Error('Het is niet gelukt om een beveiligde betaalsessie aan te maken. Controleer uw verbinding en probeer het opnieuw.');
        }

        if (!data?.sessionId) {
          logger.error('Geen sessie-ID ontvangen van create-checkout-session');
          throw new Error('Kon de betaalsessie niet verifiëren. Probeer het later opnieuw.');
        }

        logger.info('Checkout-sessie aangemaakt:', { sessionId: data.sessionId });

        await paymentRecordService.updatePaymentRecord(paymentRecord.id, { 
          stripe_sessie_id: data.sessionId 
        });

        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (stripeError) {
          logger.error('Fout bij Stripe-omleiding:', stripeError);
          throw new Error(`We konden u niet doorsturen naar de betaalpagina: ${stripeError.message}`);
        }

        return { data: { url: data.url || '' }, error: null };
      } catch (error) {
        logger.error('Fout bij het aanmaken van de checkout-sessie:', error);
        throw error;
      }
    });
  }
}

export const stripeCheckoutService = new StripeCheckoutService();
