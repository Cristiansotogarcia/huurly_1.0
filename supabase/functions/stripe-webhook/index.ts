
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error('Missing Stripe signature header');
      return new Response('Missing signature header', { status: 400 });
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error('Missing Stripe webhook secret');
      return new Response('Server configuration error', { status: 500 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('Received verified Stripe event:', event.type);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, paymentRecordId } = session.metadata || {};

      const paymentRecordUUID = paymentRecordId ? String(paymentRecordId) : null;
      const userUUID = userId ? String(userId) : null;
      const stripeCustomerId = session.customer ? String(session.customer) : null;

      console.log('Webhook session metadata', {
        paymentRecordUUID,
        userUUID,
        stripeCustomerId,
      });

      // Update payment record status
      if (paymentRecordUUID) {
        const { error: paymentUpdateError } = await supabase
          .from('payment_records')
          .update({
            status: 'completed',
            stripe_customer_id: stripeCustomerId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentRecordUUID);

        if (paymentUpdateError) {
          console.error('Failed to update payment record', {
            paymentRecordUUID,
            stripeCustomerId,
            error: paymentUpdateError,
          });
        }
      }

      // Update user subscription status
      if (userUUID) {
        const { error: userRoleError } = await supabase
          .from('user_roles')
          .update({ subscription_status: 'active' })
          .eq('user_id', userUUID);

        if (userRoleError) {
          console.error('Failed to update user role', { userUUID, error: userRoleError });
        }

        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);

        const { error: subError } = await supabase.from('subscribers').upsert(
          {
            user_id: userUUID,
            email: session.customer_details?.email || session.customer_email,
            stripe_customer_id: stripeCustomerId,
            subscribed: true,
            subscription_tier: 'huurder_yearly',
            subscription_end: expiry.toISOString(),
          },
          { onConflict: 'user_id' }
        );

        if (subError) {
          console.error('Failed to upsert subscriber', {
            userUUID,
            stripeCustomerId,
            error: subError,
          });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }
});
