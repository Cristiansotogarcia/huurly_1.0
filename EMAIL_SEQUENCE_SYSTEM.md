# Email Sequence System - Huurly

Comprehensive email reminder system for Huurly users with three automated sequences:
- **Sequence A**: Unverified email reminders (Day 2, 5, 7, with auto-delete after Day 8)
- **Sequence B**: Verified but unpaid reminders (Day 1, 3, 7, 14)
- **Sequence C**: Paid but incomplete profile reminders (Day 1, 3, 7, 14)

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Cron Job Setup](#cron-job-setup)
- [Testing](#testing)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Email Sequences
- ✅ Three automated sequences based on user lifecycle stage
- ✅ All emails in Dutch, focused on "being findable" for landlords
- ✅ BCC copy to team@huurly.nl for monitoring
- ✅ Prevents duplicate sends using email_sequence_log
- ✅ Respects user unsubscribe preferences
- ✅ Auto-deletes unverified accounts after 8 days

### User Management
- ✅ Unsubscribe page with two options:
  - Unsubscribe from reminders (keep account)
  - Delete account completely
- ✅ Tracks unsubscribe reasons for feedback
- ✅ Lifecycle event tracking (signup, verification, payment, profile completion)

### Email Content
- ✅ Sequence A: Friendly → Urgent → Final Warning
- ✅ Sequence B: Welcome → Benefits → Reserved Spot → Last Call (€35 pricing)
- ✅ Sequence C: Completion → Halfway → Maximize → Active Landlords
- ✅ Unsubscribe links in every email
- ✅ Responsive HTML templates

---

## 🏗️ Architecture

### Database Tables

```
email_preferences
├── user_id (uuid, FK to auth.users)
├── unsubscribed_from_reminders (boolean)
├── unsubscribed_from_marketing (boolean)
├── unsubscribed_at (timestamptz)
└── unsubscribe_reason (text)

email_sequence_log
├── user_id (uuid, FK to auth.users)
├── sequence_type (text: 'unverified', 'unpaid', 'incomplete_profile')
├── email_number (integer: 1-4)
├── sent_at (timestamptz)
├── status (text: 'sent', 'delivered', 'bounced', 'failed')
├── resend_message_id (text)
└── error_message (text)

user_lifecycle_events
├── user_id (uuid, FK to auth.users)
├── event_type (text: 'signup', 'email_verified', 'payment_completed', 'profile_completed')
├── event_data (jsonb)
└── created_at (timestamptz)
```

### Edge Functions

```
check-email-sequences/
├── index.ts           # Main sequence checker (runs daily via cron)
└── email-templates.ts # Dutch email templates

unsubscribe/
└── index.ts          # Unsubscribe handler with UI
```

### Database Functions

- `get_unpaid_verified_users()` - Returns users who verified email but have no active subscription
- `get_paid_incomplete_users()` - Returns users with active subscription but incomplete profile
- `should_send_email()` - Checks if user should receive email (not unsubscribed + not already sent)
- `get_last_sequence_email()` - Returns the last email number sent for a sequence

---

## 🚀 Deployment

### Step 1: Deploy Database Migration

```bash
# Apply the migration to create tables and functions
supabase db push
```

This creates:
- 3 new tables (email_preferences, email_sequence_log, user_lifecycle_events)
- 4 database functions
- All necessary indexes and RLS policies

### Step 2: Deploy Edge Functions

```bash
# Deploy the email checker function
supabase functions deploy check-email-sequences --no-verify-jwt

# Deploy the unsubscribe handler
supabase functions deploy unsubscribe --no-verify-jwt
```

### Step 3: Set Environment Variables

```bash
# Set all required secrets
supabase secrets set \
  RESEND_API_KEY="your_resend_api_key" \
  RESEND_FROM_EMAIL="team@huurly.nl" \
  EMAIL_BCC_MONITORING="team@huurly.nl"
```

Optional: You can customize the BCC email or disable it:
```bash
# To disable BCC monitoring, leave EMAIL_BCC_MONITORING empty
supabase secrets set EMAIL_BCC_MONITORING=""
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `RESEND_API_KEY` | Yes | Your Resend API key for sending emails | `re_xxxxx` |
| `RESEND_FROM_EMAIL` | Yes | From email address | `team@huurly.nl` |
| `EMAIL_BCC_MONITORING` | No | BCC email for monitoring (defaults to team@huurly.nl) | `team@huurly.nl` |
| `SUPABASE_URL` | Auto | Automatically provided by Supabase | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto | Automatically provided by Supabase | - |

### Email Sequence Timing

Timing is configured in `check-email-sequences/index.ts`:

```typescript
const SEQUENCE_TIMING = {
  unverified: [2, 5, 7],      // Days after signup
  unpaid: [1, 3, 7, 14],       // Days after verification  
  incomplete_profile: [1, 3, 7, 14]  // Days after payment
}

const DELETE_UNVERIFIED_AFTER_DAYS = 8  // Auto-delete after 8 days
```

To change timing, edit these values and redeploy:
```bash
supabase functions deploy check-email-sequences --no-verify-jwt
```

---

## ⏰ Cron Job Setup

The `check-email-sequences` function should run **once daily** to check for users needing reminder emails.

### Option 1: Supabase Cron (Recommended)

Add to your `supabase/config.toml`:

```toml
[functions.check-email-sequences]
verify_jwt = false

# Run daily at 9:00 AM UTC
[[functions.check-email-sequences.cron]]
schedule = "0 9 * * *"
```

Then deploy:
```bash
supabase functions deploy check-email-sequences
```

### Option 2: External Cron Service (e.g., cron-job.org)

1. Get your function URL:
   ```
   https://<project-ref>.supabase.co/functions/v1/check-email-sequences
   ```

2. Set up a cron job to call this URL daily:
   - URL: `https://<project-ref>.supabase.co/functions/v1/check-email-sequences`
   - Method: POST
   - Headers: `Authorization: Bearer <anon-key>`
   - Schedule: Daily at 9:00 AM

### Option 3: Vercel Cron (if using Vercel)

Create `api/cron/check-emails.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  runtime: 'edge',
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return response.status(401).json({ error: 'Unauthorized' })
  }

  const result = await fetch(
    `${process.env.SUPABASE_URL}/functions/v1/check-email-sequences`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`
      }
    }
  )

  const data = await result.json()
  return response.status(200).json(data)
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/check-emails",
    "schedule": "0 9 * * *"
  }]
}
```

---

## 🧪 Testing

### Manual Testing

You can manually trigger the email checker:

```bash
# Using Supabase CLI
supabase functions invoke check-email-sequences

# Using curl
curl -X POST \
  https://<project-ref>.supabase.co/functions/v1/check-email-sequences \
  -H "Authorization: Bearer <anon-key>"
```

### Test Scenarios

#### 1. Test Unverified Sequence

```sql
-- Create a test user with unverified email (2 days old)
INSERT INTO auth.users (id, email, created_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'test@example.com',
  now() - interval '2 days',
  '{"first_name": "Test", "role": "huurder"}'::jsonb
);
```

#### 2. Test Unpaid Sequence

```sql
-- Create a verified user without subscription (3 days ago)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'test-verified@example.com',
  now() - interval '3 days',
  now() - interval '3 days',
  '{"first_name": "Test", "role": "huurder"}'::jsonb
);
```

#### 3. Test Incomplete Profile Sequence

```sql
-- Create a paid user with incomplete profile
WITH new_user AS (
  INSERT INTO auth.users (id, email, email_confirmed_at, created_at, raw_user_meta_data)
  VALUES (
    gen_random_uuid(),
    'test-paid@example.com',
    now(),
    now() - interval '1 day',
    '{"first_name": "Test", "role": "huurder"}'::jsonb
  )
  RETURNING id
),
new_gebruiker AS (
  INSERT INTO public.gebruikers (id, email, naam, rol, profiel_compleet)
  SELECT id, email, 'Test User', 'huurder', false
  FROM new_user
  RETURNING id
),
new_huurder AS (
  INSERT INTO public.huurders (id)
  SELECT id FROM new_gebruiker
  RETURNING id
)
INSERT INTO public.abonnementen (huurder_id, status, start_datum, bedrag)
SELECT id, 'actief', now()::text, 35
FROM new_huurder;

-- Insert lifecycle event
INSERT INTO public.user_lifecycle_events (user_id, event_type, created_at)
SELECT id, 'payment_completed', now() - interval '1 day'
FROM new_user;
```

#### 4. Test Unsubscribe

Visit:
```
https://<project-ref>.supabase.co/functions/v1/unsubscribe?user=<user-id>&type=reminders
```

### Check Logs

```sql
-- View recent email logs
SELECT 
  u.email,
  e.sequence_type,
  e.email_number,
  e.sent_at,
  e.status,
  e.error_message
FROM email_sequence_log e
JOIN auth.users u ON e.user_id = u.id
ORDER BY e.sent_at DESC
LIMIT 20;

-- Check unsubscribed users
SELECT 
  u.email,
  ep.unsubscribed_at,
  ep.unsubscribe_reason
FROM email_preferences ep
JOIN auth.users u ON ep.user_id = u.id
WHERE ep.unsubscribed_from_reminders = true;
```

---

## 📊 Monitoring

### Key Metrics to Track

1. **Email Send Rate**
   ```sql
   SELECT 
     sequence_type,
     email_number,
     COUNT(*) as sends,
     COUNT(CASE WHEN status = 'failed' THEN 1 END) as failures
   FROM email_sequence_log
   WHERE sent_at > now() - interval '7 days'
   GROUP BY sequence_type, email_number
   ORDER BY sequence_type, email_number;
   ```

2. **Unsubscribe Rate**
   ```sql
   SELECT 
     COUNT(*) as total_unsubscribed,
     unsubscribe_reason,
     COUNT(*) * 100.0 / (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as percentage
   FROM email_preferences
   WHERE unsubscribed_from_reminders = true
   GROUP BY unsubscribe_reason;
   ```

3. **Conversion Tracking**
   ```sql
   -- Users who verified after reminder
   SELECT COUNT(*) as verified_after_reminder
   FROM auth.users u
   WHERE email_confirmed_at IS NOT NULL
   AND EXISTS (
     SELECT 1 FROM email_sequence_log e
     WHERE e.user_id = u.id
     AND e.sequence_type = 'unverified'
     AND e.sent_at < u.email_confirmed_at
   );
   ```

### BCC Monitoring

All reminder emails are BCC'd to `team@huurly.nl` (configurable). This allows you to:
- Verify emails are being sent correctly
- Review email content in production
- Monitor delivery timing
- Quickly debug any issues

---

## 🐛 Troubleshooting

### Emails Not Sending

**Check 1: Verify Resend API Key**
```bash
supabase secrets list
```

**Check 2: Check Function Logs**
```bash
supabase functions logs check-email-sequences
```

**Check 3: Test Resend API Directly**
```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "team@huurly.nl",
    "to": ["your-email@example.com"],
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

### Duplicate Emails

The system prevents duplicates using `should_send_email()` function. If duplicates occur:

```sql
-- Check for duplicate logs
SELECT user_id, sequence_type, email_number, COUNT(*)
FROM email_sequence_log
WHERE status = 'sent'
GROUP BY user_id, sequence_type, email_number
HAVING COUNT(*) > 1;
```

### Cron Not Running

**Supabase Cron:**
```bash
# Check cron configuration
supabase functions list

# Manually trigger to test
supabase functions invoke check-email-sequences
```

**External Cron:**
- Verify the cron service is active
- Check authorization headers
- Review cron service logs

### Users Not Receiving Emails

1. **Check user isn't unsubscribed:**
   ```sql
   SELECT * FROM email_preferences WHERE user_id = '<user-id>';
   ```

2. **Check email log:**
   ```sql
   SELECT * FROM email_sequence_log 
   WHERE user_id = '<user-id>' 
   ORDER BY sent_at DESC;
   ```

3. **Verify user qualifies for sequence:**
   ```sql
   -- For unpaid sequence
   SELECT * FROM get_unpaid_verified_users() WHERE id = '<user-id>';
   
   -- For incomplete profile sequence
   SELECT * FROM get_paid_incomplete_users() WHERE id = '<user-id>';
   ```

---

## 📝 Lifecycle Event Tracking

To properly track user lifecycle events and trigger the correct sequences, you need to insert events at key points:

### 1. On Email Verification

Add to your email confirmation handler:

```typescript
// After successful email verification
await supabase
  .from('user_lifecycle_events')
  .insert({
    user_id: userId,
    event_type: 'email_verified',
    event_data: { verified_at: new Date().toISOString() }
  })
```

### 2. On Payment Completion

Add to your Stripe webhook handler:

```typescript
// After successful payment
await supabase
  .from('user_lifecycle_events')
  .insert({
    user_id: userId,
    event_type: 'payment_completed',
    event_data: { 
      amount: 35,
      stripe_payment_intent_id: paymentIntent.id 
    }
  })
```

### 3. On Profile Completion

Add to your profile update handler:

```typescript
// When profile becomes complete
if (isProfileComplete(profile)) {
  await supabase
    .from('user_lifecycle_events')
    .insert({
      user_id: userId,
      event_type: 'profile_completed',
      event_data: { completed_at: new Date().toISOString() }
    })
}
```

---

## 🔐 Security

- ✅ All tables use Row Level Security (RLS)
- ✅ Functions use `SECURITY DEFINER` for controlled access
- ✅ Email preferences can only be updated by the user themselves
- ✅ Unsubscribe handler validates user IDs
- ✅ No JWT verification needed for public endpoints (unsubscribe, cron)

---

## 📈 Future Enhancements

Potential improvements for the system:

- [ ] Add email open/click tracking via Resend webhooks
- [ ] A/B testing for email subject lines
- [ ] Dynamic content based on user profile
- [ ] SMS reminders for critical actions
- [ ] Admin dashboard for email analytics
- [ ] Personalized send times based on user timezone
- [ ] Re-engagement campaigns for dormant users

---

## 📞 Support

For issues or questions:
- Email: team@huurly.nl
- Check function logs: `supabase functions logs`
- Review this documentation
- Check Resend dashboard for delivery status

---

## 📄 Files Created

```
supabase/
├── migrations/
│   └── 20250107000000_create_email_sequence_tables.sql
└── functions/
    ├── check-email-sequences/
    │   ├── index.ts
    │   └── email-templates.ts
    └── unsubscribe/
        └── index.ts

EMAIL_SEQUENCE_SYSTEM.md (this file)
```

---

**Last Updated:** January 7, 2025
**Version:** 1.0.0
