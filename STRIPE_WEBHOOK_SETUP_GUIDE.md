# Stripe Webhook Configuration Guide

## The 401 Error Explained

The 401 error in your Supabase logs indicates that Stripe is successfully calling your webhook endpoint, but the signature verification is failing. This is a security feature to ensure the webhook calls are actually from Stripe.

## Steps to Fix the Webhook

### 1. Get Your Webhook Endpoint URL

Your webhook endpoint URL is:
```
https://sqhultitvpivlnlgogen.supabase.co/functions/v1/stripe-webhook
```

### 2. Configure Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://sqhultitvpivlnlgogen.supabase.co/functions/v1/stripe-webhook`
4. Select the following events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_failed`
   - `checkout.session.expired`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"

### 3. Get the Webhook Signing Secret

After creating the webhook:
1. Click on the webhook you just created
2. Click "Reveal" under "Signing secret"
3. Copy the secret (it starts with `whsec_`)

### 4. Set the Webhook Secret in Supabase

```bash
# Set the webhook secret in your Edge Functions
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 5. Verify All Secrets Are Set

```bash
# List all secrets to ensure they're set
supabase secrets list
```

You should see:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

### 6. Redeploy the Webhook Function

```bash
# Deploy the stripe-webhook function with the new secret
supabase functions deploy stripe-webhook
```

## Testing the Webhook

### Option 1: Use Stripe CLI (Recommended for Local Testing)

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward events to your local endpoint
stripe listen --forward-to https://sqhultitvpivlnlgogen.supabase.co/functions/v1/stripe-webhook

# In another terminal, trigger a test event
stripe trigger checkout.session.completed
```

### Option 2: Test with Real Payment

1. Make a test payment through your application
2. Check the webhook logs in Stripe Dashboard
3. Check Supabase function logs: `supabase functions logs stripe-webhook --follow`

## Common Issues and Solutions

### Issue: "Missing signature header"
**Solution**: Ensure Stripe is sending to the correct endpoint URL

### Issue: "Webhook signature verification failed"
**Solution**: 
- Double-check the webhook secret is correctly set
- Ensure you're using the correct secret for the environment (test vs live)
- Make sure there are no extra spaces when copying the secret

### Issue: Webhook works locally but not in production
**Solution**: 
- Ensure the production webhook URL is added in Stripe
- Set the production webhook secret in Supabase

## Monitoring Webhooks

1. **Stripe Dashboard**: Go to Webhooks → Click on your endpoint → View "Webhook attempts"
2. **Supabase Logs**: `supabase functions logs stripe-webhook --follow`
3. **Check Database**: Verify records are created in the `abonnementen` table

## Security Note

Never commit your webhook secret to version control. Always use environment variables or secrets management.
