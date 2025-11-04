# Meta Conversions API Setup Guide

This guide will help you set up Meta Conversions API for server-side event tracking, which works alongside your existing Meta Pixel for improved conversion tracking accuracy.

## 🎯 What is Meta Conversions API?

The Conversions API sends events **directly from your server** to Meta, bypassing:
- Ad blockers
- Browser restrictions  
- iOS 14+ tracking limitations
- Cookie consent issues

This improves tracking accuracy by **20-30%** and provides better data for Meta's ad optimization algorithms.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Meta Business Manager account
- ✅ Meta Pixel already installed (ID: 1212895933893843)
- ✅ Access to Meta Events Manager
- ✅ Supabase project with Edge Functions deployed

## 🔧 Step 1: Get Your Meta Access Token

### 1.1 Navigate to Events Manager

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager2)
2. Select your Pixel (1212895933893843)
3. Click on **Settings** in the left sidebar

### 1.2 Access Conversions API Settings

1. In Settings, find the **Conversions API** section
2. Click on **Generate Access Token**
3. Follow the prompts to create a new token

### 1.3 Copy Your Access Token

⚠️ **Important**: Copy the access token immediately - you won't be able to see it again!

The token will look something like:
```
EAAG...approximately 200 characters...xyz
```

Keep this token secure - treat it like a password!

## 🔐 Step 2: Configure Supabase Secrets

You need to add the Meta credentials to your Supabase Edge Functions secrets.

### 2.1 Via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** → **Settings**
3. Add the following secrets:

```bash
META_PIXEL_ID=1212895933893843
META_ACCESS_TOKEN=your-actual-access-token-here
```

### 2.2 Via Supabase CLI (Alternative)

If you prefer using the CLI:

```bash
# Set Meta Pixel ID
supabase secrets set META_PIXEL_ID=1212895933893843

# Set your access token (replace with your actual token)
supabase secrets set META_ACCESS_TOKEN=EAAG...your-token...xyz
```

### 2.3 Verify Secrets Were Set

```bash
supabase secrets list
```

You should see both `META_PIXEL_ID` and `META_ACCESS_TOKEN` listed.

## 🚀 Step 3: Deploy Edge Functions

Deploy or redeploy your Stripe webhook function to use the new configuration:

```bash
# Navigate to your project directory
cd c:\Huurly_1.0

# Deploy the stripe-webhook function
supabase functions deploy stripe-webhook

# Also deploy the meta-conversions-api shared module
supabase functions deploy
```

## ✅ Step 4: Verify Implementation

### 4.1 Test with Test Mode Stripe

1. Use Stripe test mode to process a payment
2. Check Supabase Edge Function logs for:
   - `📤 Sending Purchase event to Meta Conversions API`
   - `✅ Meta Conversions API: Purchase event sent successfully`

### 4.2 Check Meta Events Manager

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager2)
2. Select your Pixel
3. Go to the **Test Events** tab
4. Look for incoming Purchase events
5. Verify events show **"Server"** as the source

### 4.3 Verify Deduplication

After a successful payment:
1. In Events Manager, find the Purchase event
2. Check the event details
3. You should see:
   - **Event Sources**: Browser + Server (both listed)
   - **Event Count**: 1 (deduplicated correctly)
   - **Match Quality**: Should improve over time

## 📊 Step 5: Monitor Performance

### 5.1 Event Match Quality

In Events Manager → Data Sources → Your Pixel → Overview:
- Check **Event Match Quality** score
- Aim for 6.0+ (Good) or 8.0+ (Great)
- Higher scores = better ad targeting

### 5.2 Deduplication Rate

In Events Manager → Settings → Conversions API:
- Monitor **Deduplication Rate**
- Aim for 70%+ deduplication
- High rate = both sources working correctly

### 5.3 Server Event Coverage

Check what percentage of events are being sent from server:
- Events with both Browser + Server = Best
- Events with only Server = Good (ad blocker bypassed)
- Events with only Browser = Client-side only

## 🎮 How It Works

### Event Flow

```
User Completes Payment
         ↓
    Stripe Webhook
         ↓
  ┌──────┴──────┐
  ↓             ↓
Client-Side   Server-Side
(Meta Pixel)  (Conversions API)
  ↓             ↓
  └──────┬──────┘
         ↓
    Meta Receives
         ↓
   Deduplicates
         ↓
  Counts as 1 Event
```

### Event Deduplication

The system uses `event_id` to deduplicate:
- **Client**: `fbq('track', 'Purchase', {...}, {eventID: 'session_xxx'})`
- **Server**: `event_id: 'session_xxx'` (same value!)
- **Meta**: Sees both, counts as 1 conversion ✅

## 🛠️ Troubleshooting

### Problem: Events Not Showing in Meta

**Solution**:
1. Check Supabase logs for errors
2. Verify `META_ACCESS_TOKEN` is set correctly
3. Ensure token hasn't expired
4. Check Meta Events Manager for API errors

### Problem: No Deduplication

**Solution**:
1. Verify `event_id` matches between client and server
2. Check that client-side Pixel is using `eventID` parameter
3. Ensure both events use same event name ("Purchase")

### Problem: Low Match Quality

**Solution**:
1. Ensure user email is being sent
2. Verify SHA256 hashing is working
3. Check that user data is complete
4. Wait 24-48 hours for Meta to process and improve scores

### Problem: "Missing Credentials" Warning

**Solution**:
1. Run: `supabase secrets list`
2. Verify both secrets are present
3. Redeploy functions after adding secrets
4. Check for typos in secret names

## 📝 Code Integration Points

The Meta Conversions API is integrated at these points:

### 1. Helper Function
**File**: `supabase/functions/_shared/meta-conversions-api.ts`
- SHA256 hashing for user data
- Event formatting
- API communication with Meta

### 2. Stripe Webhook
**File**: `supabase/functions/stripe-webhook/index.ts`
- Sends Purchase event after successful payment
- Handles both one-time and subscription payments
- Non-blocking (won't fail webhook if Meta API fails)

### 3. Event Data Sent

```typescript
{
  event_name: "Purchase",
  event_id: session.id,        // For deduplication
  event_time: unix_timestamp,
  action_source: "website",
  user_data: {
    em: [hashed_email],          // SHA256
    fn: [hashed_first_name],     // SHA256
    ln: [hashed_last_name],      // SHA256
    country: ["nl"]
  },
  custom_data: {
    currency: "EUR",
    value: 35.00,                // Amount in euros
    content_name: "Huurly Subscription"
  }
}
```

## 🎯 Best Practices

### Do's ✅
- Keep access token secure
- Monitor Event Match Quality weekly
- Check deduplication rates regularly
- Use same `event_id` for client and server
- Send as much user data as possible (email, name)

### Don'ts ❌
- Don't commit access token to Git
- Don't use different event names client vs server
- Don't send unhashed email or personal data
- Don't ignore warnings in Meta Events Manager
- Don't forget to redeploy after changing secrets

## 📞 Support Resources

- **Meta Documentation**: https://developers.facebook.com/docs/marketing-api/conversions-api
- **Event Match Quality**: https://www.facebook.com/business/help/765081237991954
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions

## 🚦 Testing Checklist

Before going live:

- [ ] Meta Access Token generated and saved
- [ ] Secrets configured in Supabase
- [ ] Edge Functions deployed
- [ ] Test payment completed successfully
- [ ] Purchase event visible in Meta Events Manager
- [ ] Event shows "Server" as source
- [ ] Event deduplication working (1 event, 2 sources)
- [ ] Match Quality score is acceptable
- [ ] No errors in Supabase function logs

## 🎉 Ready for Production

Once all checks pass:
1. Switch Stripe to production mode
2. Monitor first few real transactions
3. Check Meta Events Manager for production events
4. Verify deduplication continues working
5. Monitor Match Quality scores

Your Meta Conversions API is now fully configured and working alongside your Pixel for maximum conversion tracking accuracy! 🎯
