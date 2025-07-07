
import { paymentRecordService, PaymentRecord, PaymentRecordInsert } from './payment/PaymentRecordService';
import { stripeCheckoutService } from './payment/StripeCheckoutService';
import { subscriptionService, SubscriptionStatus } from './payment/SubscriptionService';
import { paymentWebhookService } from './payment/PaymentWebhookService';
import { pricingService } from './payment/PricingService';
import { SUBSCRIPTION_PLANS, formatPrice } from '../lib/stripe-config';
import { DatabaseResponse } from '../lib/database';

export class PaymentService {
  // Payment Record Operations
  async createPaymentRecord(paymentData: PaymentRecordInsert): Promise<PaymentRecord> {
    return paymentRecordService.createPaymentRecord(paymentData);
  }

  async updatePaymentRecord(paymentId: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord> {
    return paymentRecordService.updatePaymentRecord(paymentId, updates);
  }

  async getUserPayments(userId: string): Promise<DatabaseResponse<PaymentRecord[]>> {
    return paymentRecordService.getUserPayments(userId);
  }

  // Stripe Checkout Operations
  async createCheckoutSession(userId: string, baseUrl: string): Promise<DatabaseResponse<{ url: string }>> {
    return stripeCheckoutService.createCheckoutSession(userId, baseUrl);
  }

  // Subscription Operations
  async checkSubscriptionStatus(userId: string): Promise<DatabaseResponse<SubscriptionStatus>> {
    return subscriptionService.checkSubscriptionStatus(userId);
  }

  // Webhook Operations
  async handlePaymentSuccess(sessionId: string): Promise<DatabaseResponse<PaymentRecord>> {
    return paymentWebhookService.handlePaymentSuccess(sessionId);
  }

  async handlePaymentFailure(sessionId: string): Promise<DatabaseResponse<PaymentRecord>> {
    return paymentWebhookService.handlePaymentFailure(sessionId);
  }

  // Pricing Operations
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
        priceId: plan.priceId,
      };
    }
    
    return pricingService.getPricingInfo(role);
  }

  async requestVerhuurderApproval(userId: string, motivation?: string): Promise<DatabaseResponse<any>> {
    return pricingService.requestVerhuurderApproval(userId, motivation);
  }
}

export const paymentService = new PaymentService();
export type { PaymentRecord, PaymentRecordInsert, SubscriptionStatus };
