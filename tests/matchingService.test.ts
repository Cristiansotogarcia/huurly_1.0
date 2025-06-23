import { strict as assert } from 'node:assert';
import { MatchingService } from '../src/services/MatchingService.ts';

// Sample tenant and property to verify match score logic
const tenant = {
  min_budget: 1000,
  max_budget: 2000,
  voorkeur_stad: 'Amsterdam',
  voorkeur_woningtype: 'appartement',
  voorkeur_aantal_slaapkamers: 2,
  voorkeur_gemeubileerd: 'gemeubileerd'
};

const property = {
  huurprijs: 1500,
  stad: 'Amsterdam',
  type: 'appartement',
  aantal_slaapkamers: 2,
  gemeubileerd: 'gemeubileerd'
};

(async () => {
  const score = await MatchingService.calculateMatchScore(tenant, property);
  assert.equal(score, 100);
  console.log('matchingService tests passed');
})();
