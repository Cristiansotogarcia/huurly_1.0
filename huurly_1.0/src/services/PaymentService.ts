import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse, PaginationOptions, SortOptions } from '@/lib/database';
import { getCurrentStripeConfig, getSubscriptionPlan, SUBSCRIPTION_PLANS, PaymentStatus, SubscriptionStatus } from '@/lib/stripe';

export interface CreateSubscriptionData {
  planType: 'huurder' | 'verhuurder';
  planTier: 'basic' | 'premium';
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  planType: string;
  planTier: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentFilters {
  userId?: string;
  planType?: 'huurder' | 'verhuurder';
  planTier?: 'basic' | 'premium';
  status?: PaymentStatus;
  subscriptionStatus?: SubscriptionStatus;
  dateFrom?: string;
  dateTo?: string;
}

export class PaymentService extends DatabaseService {
  private stripeSecretKey: string;

  constructor() {
    super();
    this.stripeSecretKey = getCurrentStripeConfig().secretKey;
  }

  /**
   * Create Stripe checkout session for subscription
   */
  async createCheckoutSession(data: CreateSubscriptionData): Promise<DatabaseResponse<{ sessionId: string; url: string }>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const sanitizedData = this.sanitizeInput(data);
    
    const validation = this.validateRequiredFields(sanitizedData, [
      'planType', 'planTier', 'successUrl', 'cancelUrl'
    ]);
    if (!validation.isValid) {
      return {
        data: null,
        error: new Error(`Verplichte velden ontbreken: ${validation.missingFields.join(', ')}`),
        success: false,
      };
    }

    // Get subscription plan details
    const plan = getSubscriptionPlan(sanitizedData.planType, sanitizedData.planTier);
    if (!plan) {
      return {
        data: null,
        error: new Error('Ongeldig abonnement geselecteerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get user profile for customer creation
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', currentUserId)
        .single();

      if (!profile) {
        throw new Error('Gebruikersprofiel niet gevonden');
      }

      // Create checkout session via API call (this would typically be a backend endpoint)
      const checkoutData = {
        priceId: plan.priceId,
        customerEmail: profile.email,
        customerName: `${profile.first_name} ${profile.last_name}`,
        userId: currentUserId,
        planType: sanitizedData.planType,
        planTier: sanitizedData.planTier,
        successUrl: sanitizedData.successUrl,
        cancelUrl: sanitizedData.cancelUrl,
      };

      // For now, we'll simulate the checkout session creation
      // In a real implementation, this would call your backend API
      const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;

      // Store pending payment record
      const { data: paymentRecord, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: currentUserId,
          stripe_session_id: sessionId,
          plan_type: sanitizedData.planType,
          plan_tier: sanitizedData.planTier,
          amount: plan.price,
          currency: plan.currency,
          status: 'pending',
          subscription_status: 'inactive',
        })
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('CREATE_CHECKOUT', 'user_subscriptions', paymentRecord?.id, null, {
        sessionId,
        planType: sanitizedData.planType,
        planTier: sanitizedData.planTier,
        amount: plan.price
      });

      return { 
        data: { 
          sessionId, 
          url: checkoutUrl 
        }, 
        error: null 
      };
    });
  }

  /**
   * Handle successful payment webhook
   */
  async handlePaymentSuccess(
    sessionId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    subscriptionData: any
  ): Promise<DatabaseResponse<PaymentRecord>> {
    return this.executeQuery(async () => {
      // Find pending payment record
      const { data: paymentRecord } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .eq('status', 'pending')
        .single();

      if (!paymentRecord) {
        throw new Error('Betalingsrecord niet gevonden');
      }

      // Update payment record with success
      const { data: updatedRecord, error } = await supabase
        .from('user_subscriptions')
        .update({
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          status: 'completed',
          subscription_status: 'active',
          current_period_start: subscriptionData.current_period_start,
          current_period_end: subscriptionData.current_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentRecord.id)
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      // Update user role based on subscription
      await supabase
        .from('user_roles')
        .upsert({
          user_id: paymentRecord.user_id,
          role: paymentRecord.plan_type === 'verhuurder' ? 'Landlord' : 'Tenant',
          subscription_tier: paymentRecord.plan_tier,
        });

      // Create notification
      await supabase.from('notifications').insert({
        user_id: paymentRecord.user_id,
        type: 'payment_success',
        title: 'Betaling succesvol',
        message: `Je ${paymentRecord.plan_tier} abonnement is geactiveerd.`,
        is_read: false,
      });

      await this.createAuditLog('PAYMENT_SUCCESS', 'user_subscriptions', updatedRecord?.id, paymentRecord, updatedRecord);

      return { data: updatedRecord as PaymentRecord, error: null };
    });
  }

  /**
   * Handle failed payment webhook
   */
  async handlePaymentFailure(
    sessionId: string,
    reason: string
  ): Promise<DatabaseResponse<boolean>> {
    return this.executeQuery(async () => {
      // Find pending payment record
      const { data: paymentRecord } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .eq('status', 'pending')
        .single();

      if (!paymentRecord) {
        throw new Error('Betalingsrecord niet gevonden');
      }

      // Update payment record with failure
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'failed',
          failure_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentRecord.id);

      if (error) {
        throw this.handleDatabaseError(error);
      }

      // Create notification
      await supabase.from('notifications').insert({
        user_id: paymentRecord.user_id,
        type: 'payment_failed',
        title: 'Betaling mislukt',
        message: `Je betaling is mislukt. Probeer het opnieuw. Reden: ${reason}`,
        is_read: false,
      });

      await this.createAuditLog('PAYMENT_FAILED', 'user_subscriptions', paymentRecord.id, paymentRecord, { reason });

      return { data: true, error: null };
    });
  }

  /**
   * Get user's current subscription
   */
  async getCurrentSubscription(userId?: string): Promise<DatabaseResponse<PaymentRecord | null>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const targetUserId = userId || currentUserId;

    // Check permissions
    const hasPermission = await this.checkUserPermission(targetUserId, ['Manager']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot deze gegevens'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('subscription_status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      return { data: data as PaymentRecord | null, error: null };
    });
  }

  /**
   * Get subscription history
   */
  async getSubscriptionHistory(
    userId?: string,
    filters?: PaymentFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<DatabaseResponse<PaymentRecord[]>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const targetUserId = userId || currentUserId;

    // Check permissions
    const hasPermission = await this.checkUserPermission(targetUserId, ['Manager']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot deze gegevens'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      let query = supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', targetUserId);

      // Apply filters
      if (filters?.planType) {
        query = query.eq('plan_type', filters.planType);
      }

      if (filters?.planTier) {
        query = query.eq('plan_tier', filters.planTier);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.subscriptionStatus) {
        query = query.eq('subscription_status', filters.subscriptionStatus);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      // Apply sorting
      query = this.applySorting(query, sort || { column: 'created_at', ascending: false });

      // Apply pagination
      query = this.applyPagination(query, pagination);

      const { data, error } = await query;

      if (error) {
        throw this.handleDatabaseError(error);
      }

      return { data: data as PaymentRecord[], error: null };
    });
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, reason?: string): Promise<DatabaseResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Find subscription
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (!subscription) {
        throw new Error('Abonnement niet gevonden');
      }

      // Check if user owns this subscription
      const hasPermission = await this.checkUserPermission(subscription.user_id, ['Manager']);
      if (!hasPermission) {
        throw new Error('Geen toegang tot dit abonnement');
      }

      // Update subscription status
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          subscription_status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      if (error) {
        throw this.handleDatabaseError(error);
      }

      // Update user role to basic
      await supabase
        .from('user_roles')
        .update({
          subscription_tier: null,
        })
        .eq('user_id', subscription.user_id);

      // Create notification
      await supabase.from('notifications').insert({
        user_id: subscription.user_id,
        type: 'subscription_cancelled',
        title: 'Abonnement geannuleerd',
        message: 'Je abonnement is succesvol geannuleerd.',
        is_read: false,
      });

      await this.createAuditLog('CANCEL_SUBSCRIPTION', 'user_subscriptions', subscriptionId, subscription, { reason });

      return { data: true, error: null };
    });
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Manager']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot statistieken'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data: subscriptions, error } = await supabase
        .from('user_subscriptions')
        .select('plan_type, plan_tier, amount, status, subscription_status, created_at');

      if (error) {
        throw this.handleDatabaseError(error);
      }

      const totalSubscriptions = subscriptions?.length || 0;
      const activeSubscriptions = subscriptions?.filter(s => s.subscription_status === 'active').length || 0;
      const cancelledSubscriptions = subscriptions?.filter(s => s.subscription_status === 'cancelled').length || 0;
      
      const totalRevenue = subscriptions
        ?.filter(s => s.status === 'completed')
        .reduce((sum, s) => sum + (s.amount || 0), 0) || 0;

      const monthlyRevenue = subscriptions
        ?.filter(s => s.subscription_status === 'active')
        .reduce((sum, s) => sum + (s.amount || 0), 0) || 0;

      // Revenue by plan
      const revenueByPlan = subscriptions?.reduce((acc: any, sub: any) => {
        const key = `${sub.plan_type}_${sub.plan_tier}`;
        acc[key] = (acc[key] || 0) + (sub.amount || 0);
        return acc;
      }, {}) || {};

      const statistics = {
        totalSubscriptions,
        activeSubscriptions,
        cancelledSubscriptions,
        totalRevenue,
        monthlyRevenue,
        revenueByPlan,
        conversionRate: totalSubscriptions > 0 ? (activeSubscriptions / totalSubscriptions) * 100 : 0,
        churnRate: totalSubscriptions > 0 ? (cancelledSubscriptions / totalSubscriptions) * 100 : 0,
      };

      return { data: statistics, error: null };
    });
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(userId?: string): Promise<boolean> {
    const targetUserId = userId || await this.getCurrentUserId();
    if (!targetUserId) return false;

    try {
      const result = await this.getCurrentSubscription(targetUserId);
      return result.success && result.data !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get subscription limits for user
   */
  async getSubscriptionLimits(userId?: string): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const targetUserId = userId || currentUserId;

    try {
      const subscriptionResult = await this.getCurrentSubscription(targetUserId);
      
      if (!subscriptionResult.success || !subscriptionResult.data) {
        // No active subscription - return free tier limits
        return {
          data: {
            maxProperties: 1,
            maxApplications: 3,
            maxViewings: 5,
            hasMatchingAlgorithm: false,
            hasPrioritySupport: false,
            hasAdvancedFilters: false,
          },
          error: null,
          success: true,
        };
      }

      const subscription = subscriptionResult.data;
      const plan = getSubscriptionPlan(subscription.plan_type as any, subscription.plan_tier as any);

      if (!plan) {
        throw new Error('Abonnementsplan niet gevonden');
      }

      // Define limits based on plan
      const limits = {
        huurder: {
          basic: {
            maxApplications: 10,
            maxViewings: 20,
            hasMatchingAlgorithm: false,
            hasPrioritySupport: false,
            hasAdvancedFilters: true,
          },
          premium: {
            maxApplications: -1, // unlimited
            maxViewings: -1, // unlimited
            hasMatchingAlgorithm: true,
            hasPrioritySupport: true,
            hasAdvancedFilters: true,
          }
        },
        verhuurder: {
          basic: {
            maxProperties: 5,
            maxApplications: 50,
            maxViewings: 100,
            hasMatchingAlgorithm: false,
            hasPrioritySupport: false,
            hasAdvancedFilters: true,
          },
          premium: {
            maxProperties: -1, // unlimited
            maxApplications: -1, // unlimited
            maxViewings: -1, // unlimited
            hasMatchingAlgorithm: true,
            hasPrioritySupport: true,
            hasAdvancedFilters: true,
          }
        }
      };

      const userLimits = limits[subscription.plan_type as keyof typeof limits]?.[subscription.plan_tier as keyof typeof limits.huurder] || {};

      return {
        data: userLimits,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        success: false,
      };
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
