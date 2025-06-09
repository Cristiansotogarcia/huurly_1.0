import { supabase } from '../integrations/supabase/client.ts';
import { getStripe, SUBSCRIPTION_PLANS, formatPrice } from '../lib/stripe.ts';
import { DatabaseService, DatabaseResponse } from '../lib/database.ts';
import { ErrorHandler } from '../lib/errors.ts';
import { Tables, TablesInsert } from '../integrations/supabase/types.ts';
import { logger } from '../lib/logger.ts';

export type PaymentRecord = Tables<'payment_records'>;

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionType?: string;
  expiresAt?: string;
}

export class PaymentService extends DatabaseService {
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

      // Create payment record - amount must be in cents (integer)
      const paymentData: TablesInsert<'payment_records'> = {
        user_id: userId,
        email: user.email,
        user_type: 'huurder',
        amount: Math.round(plan.priceWithTax * 100), // Convert euros to cents
        status: 'pending',
      };

      const { data: paymentRecord, error: paymentError } = await supabase
        .from('payment_records')
        .insert(paymentData)
        .select()
        .single();

      if (paymentError) {
        throw ErrorHandler.handleDatabaseError(paymentError);
      }

      // Create Stripe checkout session using Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: plan.priceId,
          userId: userId,
          userEmail: user.email,
          paymentRecordId: paymentRecord.id,
          successUrl: `${window.location.origin}/huurder-dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/huurder-dashboard?payment=cancelled`,
        },
      });

      if (error) {
        throw new Error('Fout bij het aanmaken van betaling: ' + error.message);
      }

      if (!data?.sessionId) {
        throw new Error('Geen sessie ID ontvangen van Stripe');
      }

      // Update payment record with session ID
      await supabase
        .from('payment_records')
        .update({ stripe_session_id: data.sessionId })
        .eq('id', paymentRecord.id);

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
      const { data, error } = await supabase
        .from('payment_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: data || [], error: null };
    });
  }

  /**
   * Check if user has active subscription
   */
  async checkSubscriptionStatus(userId: string): Promise<DatabaseResponse<SubscriptionStatus>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('payment_records')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      if (!data || data.length === 0) {
        return {
          data: { hasActiveSubscription: false } as SubscriptionStatus,
          error: null
        };
      }

      const latestPayment = data[0];
      
      // For yearly subscription, check if it's still valid (simplified logic)
      if (latestPayment.user_type === 'huurder') {
        const paymentDate = new Date(latestPayment.created_at);
        const expiryDate = new Date(paymentDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        
        const isActive = new Date() < expiryDate;
        
        return {
          data: {
            hasActiveSubscription: isActive,
            subscriptionType: 'huurder_yearly',
            expiresAt: expiryDate.toISOString()
          } as SubscriptionStatus,
          error: null
        };
      }

      return {
        data: { 
          hasActiveSubscription: true, 
          subscriptionType: 'huurder_yearly' 
        } as SubscriptionStatus,
        error: null
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
        .from('payment_records')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_session_id', sessionId)
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      // Update user role subscription status
      await supabase
        .from('user_roles')
        .update({ subscription_status: 'active' })
        .eq('user_id', data.user_id);

      // Create audit log
      await this.createAuditLog('PAYMENT_SUCCESS', 'payment_records', data.id, null, data);

      return { data, error: null };
    });
  }

  /**
   * Handle failed payment (webhook)
   */
  async handlePaymentFailure(sessionId: string): Promise<DatabaseResponse<PaymentRecord>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('payment_records')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_session_id', sessionId)
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      // Create audit log
      await this.createAuditLog('PAYMENT_FAILED', 'payment_records', data.id, null, data);

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

      // Create notification for all managers/beheerders
      const { data: managers } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'Beheerder');

      if (managers) {
        const notifications = managers.map(manager => ({
          user_id: manager.user_id,
          type: 'system_announcement',
          title: 'Nieuwe verhuurder goedkeuring',
          message: 'Een nieuwe verhuurder vraagt om account activatie.',
          read: false,
          created_at: new Date().toISOString()
        }));

        await supabase.from('notifications').insert(notifications);
      }

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
