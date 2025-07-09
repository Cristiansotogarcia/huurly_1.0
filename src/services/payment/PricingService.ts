
import { SUBSCRIPTION_PLANS, formatPrice } from '../../lib/stripe-config.ts';
import { DatabaseService, DatabaseResponse } from '../../lib/database.ts';
import { ErrorHandler } from '../../lib/errors.ts';
import { logger } from '../../lib/logger.ts';

export class PricingService extends DatabaseService {
  getPricingInfo(role: 'huurder' | 'verhuurder') {
    if (role === 'huurder') {
      const plan = SUBSCRIPTION_PLANS.huurder.halfyearly;
      return {
        displayPrice: formatPrice(plan.price),
        actualPrice: formatPrice(plan.priceWithTax),
        taxAmount: formatPrice(plan.priceWithTax - plan.price),
        taxRate: `${(plan.taxRate * 100).toFixed(0)}%`,
        interval: plan.interval,
        features: plan.features,
        description: `${formatPrice(plan.price)} per 6 maanden (excl. BTW)\n${formatPrice(plan.priceWithTax)} per 6 maanden (incl. ${(plan.taxRate * 100).toFixed(0)}% BTW)`
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

export const pricingService = new PricingService();
