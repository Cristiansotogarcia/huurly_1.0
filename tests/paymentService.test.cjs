require('ts-node/register');
const assert = require('node:assert');
const { paymentService } = require('../src/services/PaymentService');

try {
  const infoHuurder = paymentService.getPricingInfo('huurder');
  assert.equal(infoHuurder.interval, 'year');
  assert.ok(infoHuurder.displayPrice.includes('€'));
  const infoVerhuurder = paymentService.getPricingInfo('verhuurder');
  assert.equal(infoVerhuurder.displayPrice, 'Gratis');
  assert.equal(infoVerhuurder.actualPrice, 'Gratis');
  console.log('paymentService tests passed');
} catch (err) {
  console.error(err);
  process.exit(1);
}
