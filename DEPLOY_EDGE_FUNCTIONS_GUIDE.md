# How to Deploy Supabase Edge Functions

## Prerequisites

1. **Supabase CLI**: Make sure you have the Supabase CLI installed
   ```bash
   # Install via npm
   npm install -g supabase
   
   # Or via Homebrew (macOS)
   brew install supabase/tap/supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

## Deployment Steps

### 1. Link Your Project

First, link your local project to your Supabase project:

```bash
# Get your project reference ID from your Supabase dashboard
supabase link --project-ref your-project-ref
```

You can find your project reference ID in the Supabase dashboard URL: `https://app.supabase.com/project/[your-project-ref]`

### 2. Set Environment Variables

Before deploying, ensure your Edge Function secrets are set:

```bash
# Set the Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Set the Stripe webhook secret
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# List all secrets to verify (values will be hidden)
supabase secrets list
```

### 3. Deploy the Edge Functions

Deploy all functions:

```bash
# Deploy all functions in the supabase/functions directory
supabase functions deploy
```

Or deploy specific functions:

```bash
# Deploy only the create-checkout-session function
supabase functions deploy create-checkout-session

# Deploy multiple specific functions
supabase functions deploy create-checkout-session stripe-webhook
```

### 4. Verify Deployment

After deployment, you can verify your functions are running:

```bash
# List all deployed functions
supabase functions list
```

## Important Edge Functions to Deploy

For the payment flow to work, you need to deploy these functions:

1. **create-checkout-session** - Creates Stripe checkout sessions
2. **stripe-webhook** - Handles Stripe webhook events
3. **register-user** - Handles user registration
4. **get-stripe-session** - Retrieves Stripe session details
5. **manage-subscription** - Manages subscription operations

Deploy all of them:

```bash
supabase functions deploy create-checkout-session stripe-webhook register-user get-stripe-session manage-subscription
```

## Troubleshooting

### Check Function Logs

If something goes wrong, check the logs:

```bash
# View logs for a specific function
supabase functions logs create-checkout-session

# Follow logs in real-time
supabase functions logs create-checkout-session --follow
```

### Common Issues

1. **"Function not found"**: Make sure you're in the project root directory (where the `supabase` folder is located)

2. **"Unauthorized"**: Ensure you're logged in with `supabase login`

3. **"Project not linked"**: Run `supabase link --project-ref your-project-ref`

4. **Environment variables not working**: 
   - Verify secrets are set: `supabase secrets list`
   - Re-deploy after setting secrets

## Quick Deploy Script

Create a script to deploy all payment-related functions at once:

```bash
#!/bin/bash
# deploy-functions.sh

echo "Deploying Supabase Edge Functions..."

# Deploy all payment-related functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy get-stripe-session
supabase functions deploy manage-subscription
supabase functions deploy register-user

echo "✅ All functions deployed successfully!"

# Show deployed functions
supabase functions list
```

Make it executable:
```bash
chmod +x deploy-functions.sh
./deploy-functions.sh
```

## Verify Everything is Working

After deployment:

1. Check the Supabase dashboard → Functions section
2. Test the payment flow in your application
3. Monitor the function logs for any errors
4. Check that environment variables are properly set

## Additional Notes

- Edge Functions are automatically scaled by Supabase
- Changes to function code require redeployment
- Environment variables (secrets) can be updated without redeploying
- Functions have a default timeout of 60 seconds
- CORS headers are handled in the `_shared/cors.ts` file
