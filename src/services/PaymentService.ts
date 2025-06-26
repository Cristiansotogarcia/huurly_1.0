
import { paymentRecordService, PaymentRecord, PaymentRecordInsert } from './payment/PaymentRecordService.ts';
import { stripeCheckoutService } from './payment/StripeCheckoutService.ts';
import { subscriptionService, SubscriptionStatus } from './payment/SubscriptionService.ts';
import { paymentWebhookService } from './payment/PaymentWebhookService.ts';
import { pricingService } from './payment/PricingService.ts';
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
  async createCheckoutSession(userId: string): Promise<DatabaseResponse<{ url: string }>> {
    return stripeCheckoutService.createCheckoutSession(userId);
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
    return pricingService.getPricingInfo(role);
  }

  async requestVerhuurderApproval(userId: string, motivation?: string): Promise<DatabaseResponse<any>> {
    return pricingService.requestVerhuurderApproval(userId, motivation);
  }
}

export const paymentService = new PaymentService();
export type { PaymentRecord, PaymentRecordInsert, SubscriptionStatus };
