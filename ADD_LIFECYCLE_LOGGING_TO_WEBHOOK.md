# Add Lifecycle Event Logging to Stripe Webhook

## 🎯 Problem

The incomplete profile email sequence needs `payment_completed` events in the `user_lifecycle_events` table to calculate how many days since payment. Currently, the Stripe webhook creates subscriptions but doesn't log these lifecycle events.

## ✅ Solution

Add lifecycle event logging after successful subscription/payment creation in the Stripe webhook.

---

## 📝 Code Changes Needed

### Location: `supabase/functions/stripe-webhook/index.ts`

**Add this code in TWO places:**

### 1. After One-Time Payment Success (Line ~125, after notificationError block)

```typescript
// ✅ Log payment_completed lifecycle event for one-time payment
const { error: lifecycleError } = await supabase
  .from("user_lifecycle_events")
  .insert({
    user_id: userId,
    event_type: "payment_completed",
    event_data: {
      payment_type: "one_time",
      session_id: session.id,
      amount: session.amount_total,
      currency: session.currency,
    },
  });

if (lifecycleError) {
  console.error("❌ Failed to log payment lifecycle event", {
    userId,
    error: lifecycleError,
  });
} else {
  console.log("✅ Payment lifecycle event logged for one-time payment");
}
```

### 2. After Subscription Success (Line ~265, after notificationError block)

```typescript
// ✅ Log payment_completed lifecycle event for subscription
const { error: lifecycleError } = await supabase
  .from("user_lifecycle_events")
  .insert({
    user_id: userId,
    event_type: "payment_completed",
    event_data: {
      payment_type: "subscription",
      subscription_id: subscription.id,
      session_id: session.id,
      amount: session.amount_total,
      currency: session.currency,
    },
  });

if (lifecycleError) {
  console.error("❌ Failed to log payment lifecycle event", {
    userId,
    error: lifecycleError,
  });
} else {
  console.log("✅ Payment lifecycle event logged for subscription");
}
```

---

## 🚀 Implementation Steps

### Step 1: Backup Current Webhook
```bash
cp supabase/functions/stripe-webhook/index.ts supabase/functions/stripe-webhook/index.ts.backup
```

### Step 2: Add the Lifecycle Logging Code

Open `supabase/functions/stripe-webhook/index.ts` and add both code blocks from above.

**For one-time payments:** Add after line that creates notification (around line 125)
**For subscriptions:** Add after line that creates notification (around line 265)

### Step 3: Deploy Updated Webhook
```bash
supabase functions deploy stripe-webhook --project-ref sqhultitvpivlnlgogen
```

### Step 4: Test with New Payment

Create a test payment and verify:
```sql
-- Check if lifecycle event was logged
SELECT * 
FROM user_lifecycle_events 
WHERE event_type = 'payment_completed' 
ORDER BY created_at DESC 
LIMIT 1;
```

---

## 🔧 For Existing Subscriptions

For users who already paid (before this fix), run the backfill script in `fix_incomplete_profile_emails.sql`.

This will:
1. Create `payment_completed` events for all active subscriptions
2. Use `aangemaakt_op` from `abonnementen` table as the payment date
3. Mark events as backfilled in metadata

---

## ✅ Verification

After deploying the updated webhook:

1. **New payments will automatically log lifecycle events**
2. **Email sequences will work correctly**
3. **No manual backfilling needed for future payments**

Check anytime with:
```sql
-- Count lifecycle events by type
SELECT 
  event_type,
  COUNT(*) as count
FROM user_lifecycle_events
GROUP BY event_type;

-- Should show:
-- payment_completed: X (number of payments)
-- email_verified: Y (if tracked)
-- etc.
```

---

## 📊  Complete Flow After Fix

**User completes payment:**
1. Stripe sends webhook to your Edge Function
2. Function creates record in `abonnementen` table ✅
3. **NEW:** Function creates `payment_completed` event in `user_lifecycle_events` ✅
4. Function creates notification ✅
5. Function sends invoice email ✅

**Daily at 9 AM UTC:**
1. Cron job runs email checker
2. Finds users with incomplete profiles
3. Checks `user_lifecycle_events` for payment date ✅ (now exists!)
4. Calculates days since payment
5. Sends email if on milestone day (1, 3, 7, 14)
6. BCCs team@huurly.nl

---

## 🎉 Benefits

**Before Fix:**
- ❌ No `payment_completed` events logged
- ❌ Incomplete profile emails never sent
- ❌ Manual backfilling required for each new user

**After Fix:**
- ✅ All payment events automatically logged
- ✅ Incomplete profile emails work correctly
- ✅ No manual intervention needed
- ✅ System fully automated

---

## 💡 Optional: Log Other Lifecycle Events

While you're at it, consider logging other events:

**In auth confirmation:**
```typescript
// After email verification
await supabase.from("user_lifecycle_events").insert({
  user_id: userId,
  event_type: "email_verified"
});
```

**When profile completed:**
```typescript
// After user completes profile
await supabase.from("user_lifecycle_events").insert({
  user_id: userId,
  event_type: "profile_completed"
});
```

This gives you complete tracking of user journey and enables more sophisticated email sequences!
