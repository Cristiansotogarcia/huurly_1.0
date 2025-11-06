# Stripe Live Mode Webhook Fix

## Issue
Payment processed in Stripe live mode but application didn't record it.

## Root Cause
The webhook signing secret (`STRIPE_WEBHOOK_SECRET`) needs to be updated when switching from test to live mode. Each webhook endpoint has a DIFFERENT signing secret for test vs live mode.

## Solution Steps

### 1. Get Your Live Webhook Signing Secret

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Make sure you're in LIVE mode** (toggle in top right should show "Viewing live data")
3. Go to **Developers** → **Webhooks**
4. Find your webhook endpoint (should point to your Supabase function)
   - URL format: `https://[your-project].supabase.co/functions/v1/stripe-webhook`
5. Click on the webhook endpoint
6. Click **"Reveal"** next to "Signing secret"
7. Copy the secret (starts with `whsec_`)

### 2. Update Supabase Edge Function Secrets

You need to set the live webhook secret as an environment variable in Supabase:

**Option A: Via Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Edge Functions**
4. Find the `stripe-webhook` function
5. Add/Update the secret:
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...` (your live mode secret from step 1)

**Option B: Via Supabase CLI**
```bash
# Set the secret for the stripe-webhook function
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here
```

**Option C: Via Environment Variables**
If you're deploying via CLI, ensure your `.env` file has:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here
```

### 3. Update Other Stripe Secrets (Already Done, but verify)

Ensure these are also set to LIVE mode values:
- `STRIPE_SECRET_KEY` (starts with `sk_live_`)
- `VITE_STRIPE_PUBLISHABLE_KEY` (starts with `pk_live_`)

### 4. Verify Webhook Configuration

In Stripe Dashboard → Developers → Webhooks, ensure:
- ✅ Webhook is in **LIVE mode**
- ✅ Endpoint URL is correct
- ✅ Events are enabled:
  - `checkout.session.completed`
  - `checkout.session.async_payment_failed`
  - `checkout.session.expired`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

### 5. Test the Webhook

**Option A: Send Test Event from Stripe**
1. In Stripe Dashboard → Developers → Webhooks
2. Click your webhook endpoint
3. Click **"Send test webhook"**
4. Select `checkout.session.completed`
5. Click **"Send test webhook"**
6. Check the response (should be 200 OK)

**Option B: Make a Real Test Payment**
1. Use a live Stripe test card (e.g., 4242 4242 4242 4242)
2. Complete the payment flow
3. Check your application to see if payment is recorded

### 6. Check Webhook Logs

**In Stripe Dashboard:**
1. Go to Developers → Webhooks
2. Click your webhook endpoint
3. Check **"Logs"** tab to see recent attempts
4. Look for any failed attempts with error messages

**In Supabase:**
1. Go to your Supabase project
2. Navigate to **Functions** → **stripe-webhook** → **Logs**
3. Look for entries showing webhook verification

## Expected Log Output (Success)

```
🔐 Verifying webhook signature...
📝 Webhook secret available: true
📝 Signature available: true
📝 Body length: [number]
✅ Webhook signature verified successfully
📋 Event type: checkout.session.completed
✅ Checkout session completed: { sessionId: ..., userId: ... }
✅ One-time payment recorded successfully
```

## Common Errors

### Error: "Webhook signature verification failed"
- **Cause:** Wrong webhook secret (test secret used for live events)
- **Fix:** Update `STRIPE_WEBHOOK_SECRET` to live mode secret

### Error: "Missing Stripe signature header"
- **Cause:** Request not coming from Stripe
- **Fix:** Ensure webhook URL is correctly configured in Stripe

### Error: "Missing user ID"
- **Cause:** User metadata not passed in checkout session
- **Fix:** Check payment flow code to ensure `user_id` is in metadata

## Verification Checklist

- [ ] Stripe Dashboard is in LIVE mode
- [ ] Live webhook signing secret copied from Stripe
- [ ] `STRIPE_WEBHOOK_SECRET` updated in Supabase Edge Functions
- [ ] `STRIPE_SECRET_KEY` is live mode key (starts with `sk_live_`)
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` is live mode key (starts with `pk_live_`)
- [ ] Webhook endpoint URL is correct in Stripe
- [ ] All required events are enabled in Stripe webhook
- [ ] Test webhook sent successfully (200 OK response)
- [ ] Real payment test successful and recorded in database

## Additional Notes

- Test and Live mode have **separate** webhook signing secrets
- Each webhook endpoint has its **own unique** signing secret
- The signing secret changes if you delete and recreate the webhook
- Always verify you're in the correct mode (test/live) in Stripe Dashboard

## If Still Not Working

1. Check Supabase Edge Function logs for detailed error messages
2. Verify database table `abonnementen` exists and has correct schema
3. Check Supabase service role key has write permissions
4. Ensure no firewall/CORS blocking webhook requests
5. Contact support with specific error messages from logs
