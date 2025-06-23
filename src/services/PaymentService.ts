import { supabase } from '../integrations/supabase/client.ts';
import { getStripe, SUBSCRIPTION_PLANS, formatPrice } from '../lib/stripe.ts';
import { DatabaseService, DatabaseResponse } from '../lib/database.ts';
import { ErrorHandler } from '../lib/errors.ts';
import { Tables, TablesInsert } from '../integrations/supabase/types.ts';
import { logger } from '../lib/logger.ts';

// PaymentRecord type using the betalingen table
export type PaymentRecord = Tables<'betalingen'>;
export type PaymentRecordInsert = TablesInsert<'betalingen'>;

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionType?: string;
  expiresAt?: string;
}

export class PaymentService extends DatabaseService {
  async createPaymentRecord(paymentData: PaymentRecordInsert): Promise<PaymentRecord> {
    try {
      const { data, error } = await supabase
        .from('betalingen')
        .insert(paymentData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating payment record:', error);
        throw error;
      }

      logger.info('Payment record created', { paymentId: data.id });
      return data;
    } catch (error) {
      logger.error('Error creating payment record:', error);
      throw error;
    }
  }

  async updatePaymentRecord(paymentId: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord> {
    try {
      const { data, error } = await supabase
        .from('betalingen')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single();

      if (error) {
        logger.error('Error updating payment record:', error);
        throw error;
      }

      logger.info('Payment record updated', { paymentId });
      return data;
    } catch (error) {
      logger.error('Error updating payment record:', error);
      throw error;
    }
  }

  /**
   * Create Stripe checkout session for Huurder subscription
   */
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

      // Get user details
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Gebruiker niet gevonden');
      }

      const paymentRecord = await this.createPaymentRecord({
        huurder_id: userId,
        email: user.email || '',
        bedrag: Math.round(plan.priceWithTax * 100),
        status: 'pending',
        aangemaakt_op: new Date().toISOString(),
        bijgewerkt_op: new Date().toISOString(),
      });

      // Create Stripe checkout session using Supabase Edge Function
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

      await this.updatePaymentRecord(paymentRecord.id, { stripe_session_id: data.sessionId });

      // Redirect to Stripe Checkout
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

  /**
   * Get payment records for a user
   */
  async getUserPayments(userId: string): Promise<DatabaseResponse<PaymentRecord[]>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    // Check permissions
    const hasPermission = await this.checkUserPermission(userId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: ErrorHandler.normalize('Geen toegang tot betalingsgegevens'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase.from('betalingen').select('*').eq('huurder_id', userId).order('aangemaakt_op', { ascending: false });
      return { data, error };
    });
  }

  /**
   * Check if user has active subscription
   */
  async checkSubscriptionStatus(userId: string): Promise<DatabaseResponse<SubscriptionStatus>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase.from('betalingen').select('*').eq('huurder_id', userId).eq('status', 'completed').order('aangemaakt_op', { ascending: false }).limit(1);

      if (error) {
        return { data: null, error };
      }

      const hasActiveSubscription = data && data.length > 0;

      // This is a simplified check. A more robust implementation would check the subscription end date.
      return {
        data: {
          hasActiveSubscription,
          subscriptionType: hasActiveSubscription ? 'yearly' : undefined,
          expiresAt: hasActiveSubscription ? new Date(new Date(data[0].aangemaakt_op).setFullYear(new Date(data[0].aangemaakt_op).getFullYear() + 1)).toISOString() : undefined,
        } as SubscriptionStatus,
        error: null,
      };
    });
  }

  /**
   * Handle successful payment (webhook)
   */
  async handlePaymentSuccess(sessionId: string): Promise<DatabaseResponse<PaymentRecord>> {
    return this.executeQuery(async () => {
      // Update payment record
      const { data, error } = await supabase
        .from('betalingen')
        .update({ 
          status: 'completed',
          bijgewerkt_op: new Date().toISOString()
        })
        .eq('stripe_session_id', sessionId)
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      // Create audit log
      await this.createAuditLog('PAYMENT_SUCCESS', 'betalingen', data.id, null, data);

      return { data, error: null };
    });
  }

  /**
   * Handle failed payment (webhook)
   */
  async handlePaymentFailure(sessionId: string): Promise<DatabaseResponse<PaymentRecord>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('betalingen')
        .update({ 
          status: 'failed',
          bijgewerkt_op: new Date().toISOString()
        })
        .eq('stripe_session_id', sessionId)
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      // Create audit log
      await this.createAuditLog('PAYMENT_FAILED', 'betalingen', data.id, null, data);

      return { data, error: null };
    });
  }

  /**
   * Get pricing information for display
   */
  getPricingInfo(role: 'huurder' | 'verhuurder') {
    if (role === 'huurder') {
      const plan = SUBSCRIPTION_PLANS.huurder.yearly;
      return {
        displayPrice: formatPrice(plan.price),
        actualPrice: formatPrice(plan.priceWithTax),
        taxAmount: formatPrice(plan.priceWithTax - plan.price),
        taxRate: `${(plan.taxRate * 100).toFixed(0)}%`,
        interval: plan.interval,
        features: plan.features,
        description: `${formatPrice(plan.price)} per jaar (excl. BTW)\n${formatPrice(plan.priceWithTax)} per jaar (incl. ${(plan.taxRate * 100).toFixed(0)}% BTW)`
      };
    } else {
      const plan = SUBSCRIPTION_PLANS.verhuurder.free;
      return {
        displayPrice: 'Gratis',
        actualPrice: 'Gratis',
        taxAmount: formatPrice(0),
        taxRate: '0%',
        interval: plan.interval,
        features: plan.features,
        requiresApproval: plan.requiresApproval,
        description: 'Gratis account na goedkeuring door beheerder'
      };
    }
  }

  /**
   * Request verhuurder account approval (simplified without approval_requests table)
   */
  async requestVerhuurderApproval(userId: string, motivation?: string): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId || currentUserId !== userId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Log the approval request for now since approval_requests table doesn't exist
      logger.info('Verhuurder approval request:', {
        user_id: userId,
        motivation: motivation,
        timestamp: new Date().toISOString()
      });

      const requestData = {
        user_id: userId,
        request_type: 'verhuurder_activation',
        status: 'pending',
        motivation: motivation,
        created_at: new Date().toISOString()
      };

      await this.createAuditLog('APPROVAL_REQUEST', 'approval_requests', null, null, requestData);

      return { data: requestData, error: null };
    });
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
