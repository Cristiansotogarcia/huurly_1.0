#!/usr/bin/env node

/**
 * Stripe Webhook Diagnostic Script
 * 
 * This script helps diagnose webhook issues by checking:
 * 1. Environment variables configuration
 * 2. Stripe mode (test vs live)
 * 3. Recent webhook attempts in Stripe Dashboard
 * 
 * Usage:
 *   node scripts/diagnose-stripe-webhook.mjs
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load environment variables
config({ path: join(rootDir, '.env') });
config({ path: join(rootDir, '.env.local') });

console.log('🔍 Stripe Webhook Diagnostic Tool\n');
console.log('=' .repeat(60));

// Check environment variables
console.log('\n📋 Environment Variables Check:\n');

const requiredVars = [
  'STRIPE_SECRET_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const checks = {
  configured: [],
  missing: [],
  warnings: []
};

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    checks.configured.push(varName);
    
    // Check if keys are in correct mode
    if (varName === 'STRIPE_SECRET_KEY') {
      if (value.startsWith('sk_test_')) {
        checks.warnings.push(`${varName} is in TEST mode (sk_test_*)`);
      } else if (value.startsWith('sk_live_')) {
        console.log(`✅ ${varName}: LIVE mode (${value.substring(0, 15)}...)`);
      } else {
        checks.warnings.push(`${varName} has unexpected format`);
      }
    } else if (varName === 'VITE_STRIPE_PUBLISHABLE_KEY') {
      if (value.startsWith('pk_test_')) {
        checks.warnings.push(`${varName} is in TEST mode (pk_test_*)`);
      } else if (value.startsWith('pk_live_')) {
        console.log(`✅ ${varName}: LIVE mode (${value.substring(0, 15)}...)`);
      } else {
        checks.warnings.push(`${varName} has unexpected format`);
      }
    } else if (varName === 'STRIPE_WEBHOOK_SECRET') {
      if (value.startsWith('whsec_')) {
        console.log(`✅ ${varName}: Configured (${value.substring(0, 15)}...)`);
      } else {
        checks.warnings.push(`${varName} doesn't start with 'whsec_'`);
      }
    } else {
      console.log(`✅ ${varName}: Configured`);
    }
  } else {
    checks.missing.push(varName);
    console.log(`❌ ${varName}: Missing`);
  }
});

// Display warnings
if (checks.warnings.length > 0) {
  console.log('\n⚠️  Warnings:\n');
  checks.warnings.forEach(warning => {
    console.log(`   - ${warning}`);
  });
}

// Display summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Summary:\n');
console.log(`✅ Configured: ${checks.configured.length}/${requiredVars.length}`);
console.log(`❌ Missing: ${checks.missing.length}/${requiredVars.length}`);
console.log(`⚠️  Warnings: ${checks.warnings.length}`);

// Provide recommendations
console.log('\n' + '='.repeat(60));
console.log('\n💡 Recommendations:\n');

if (checks.missing.length > 0) {
  console.log('❌ Missing environment variables. Please configure:');
  checks.missing.forEach(v => console.log(`   - ${v}`));
  console.log('\n   These should be in your .env or .env.local file');
}

if (checks.warnings.length > 0) {
  console.log('\n⚠️  Configuration Issues Detected:');
  
  const hasTestKeys = checks.warnings.some(w => w.includes('TEST mode'));
  const hasLiveKeys = checks.warnings.some(w => w.includes('LIVE mode'));
  
  if (hasTestKeys && hasLiveKeys) {
    console.log('\n   ⚠️  MIXED MODE DETECTED!');
    console.log('   You have some keys in TEST mode and others in LIVE mode.');
    console.log('   All keys must be in the same mode (either all test or all live).');
  } else if (hasTestKeys) {
    console.log('\n   ℹ️  All keys are in TEST mode.');
    console.log('   If you want to process live payments, update to live mode keys.');
  }
  
  const hasWebhookWarning = checks.warnings.some(w => w.includes('STRIPE_WEBHOOK_SECRET'));
  if (hasWebhookWarning) {
    console.log('\n   ❌ WEBHOOK SECRET ISSUE DETECTED!');
    console.log('   Your webhook secret may be incorrectly configured.');
    console.log('   The secret should start with "whsec_"');
  }
}

// Most common issue with live payments
console.log('\n' + '='.repeat(60));
console.log('\n🔧 Common Issue with Live Payments:\n');
console.log('When switching from test to live mode, you MUST update:');
console.log('\n1. STRIPE_SECRET_KEY (sk_live_...)');
console.log('2. VITE_STRIPE_PUBLISHABLE_KEY (pk_live_...)');
console.log('3. STRIPE_WEBHOOK_SECRET (whsec_... from LIVE webhook endpoint)');
console.log('\n⚠️  The webhook secret is DIFFERENT for test vs live mode!');
console.log('   Get it from: Stripe Dashboard → Developers → Webhooks → [Your endpoint]');

console.log('\n' + '='.repeat(60));
console.log('\n📚 Next Steps:\n');
console.log('1. Review STRIPE_LIVE_MODE_WEBHOOK_FIX.md for detailed instructions');
console.log('2. Check Stripe Dashboard → Developers → Webhooks → Logs for errors');
console.log('3. Check Supabase → Functions → stripe-webhook → Logs for details');
console.log('4. Send a test webhook from Stripe Dashboard to verify configuration');
console.log('\n' + '='.repeat(60) + '\n');
