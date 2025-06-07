import { strict as assert } from 'node:assert';
import { paymentService } from '../src/services/PaymentService';
import logger from '../src/lib/logger';

// Basic unit tests for getPricingInfo
try {
  const infoHuurder = paymentService.getPricingInfo('huurder');
  assert.equal(infoHuurder.interval, 'year');
  assert.ok(infoHuurder.displayPrice.includes('€'));
  const infoVerhuurder = paymentService.getPricingInfo('verhuurder');
  assert.equal(infoVerhuurder.displayPrice, 'Gratis');
  assert.equal(infoVerhuurder.actualPrice, 'Gratis');
  logger.info('paymentService tests passed');
} catch (err) {
  logger.error({ err });
  process.exit(1);
}
