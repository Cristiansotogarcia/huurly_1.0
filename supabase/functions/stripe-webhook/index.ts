// Using Deno.serve with auth: false configuration
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from '../_shared/cors.ts';

// Zorg dat deze function geen Supabase-auth vereist
export const config = {
  auth: false,
};

// Helper function to map Stripe subscription status to Dutch enum values
const mapStripeStatusToDutch = (stripeStatus: string): string => {
  const statusMap: { [key: string]: string } = {
    'active': 'actief',
    'canceled': 'geannuleerd',
    'incomplete': 'wachtend',
    'incomplete_expired': 'verlopen',
    'past_due': 'gepauzeerd',
    'trialing': 'actief',
    'unpaid': 'gepauzeerd'
  };

  return statusMap[stripeStatus] || 'wachtend';
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16"
});
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// Verbreding van Stripe session object
type ExtendedSession = Stripe.Checkout.Session & {
  id: string;
  subscription?: string | null;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  mode: string;
  customer: string | null;
};

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  const responseHeaders = {
    ...corsHeaders,
    "Content-Type": "application/json"
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: responseHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("Missing Stripe signature header");
      return new Response("Missing signature header", { status: 400, headers: responseHeaders });
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("Missing Stripe webhook secret");
      return new Response("Server configuration error", { status: 500, headers: responseHeaders });
    }

    let event;
    try {
      console.log("🔐 Verifying webhook signature...");
      console.log("📝 Webhook secret available:", !!webhookSecret);
      console.log("📝 Signature available:", !!signature);
      console.log("📝 Body length:", body.length);

      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log("✅ Webhook signature verified successfully");
      console.log("📋 Event type:", event.type);
    } catch (err: any) {
      console.error("❌ Webhook signature verification failed:", {
        message: err.message,
        type: err.type,
        code: err.code,
        stack: err.stack
      });
      return new Response(`Webhook Error: ${err.message}`, { status: 400, headers: responseHeaders });
    }

    // === CHECKOUT SESSION COMPLETED ===
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as ExtendedSession;
      const userId = session.metadata?.user_id;

      console.log("✅ Checkout session completed:", {
        sessionId: session.id,
        userId: userId,
        subscriptionId: session.subscription,
        paymentStatus: session.payment_status,
        mode: session.mode,
        amountTotal: session.amount_total
      });

      if (!userId) {
        console.error("❌ User ID not found in session metadata");
        return new Response("Missing user ID", { status: 400, headers: responseHeaders });
      }

      // Handle one-time payments (no subscription)
      if (session.mode === 'payment' && !session.subscription) {
        console.log("✅ Processing one-time payment");

        if (session.payment_status !== 'paid') {
          console.error("❌ Payment not completed:", session.payment_status);
          return new Response("Payment not completed", { status: 400, headers: responseHeaders });
        }

        // ✅ Voeg eenmalige betaling toe aan abonnementen tabel
        const paymentData = {
          huurder_id: userId,
          status: 'actief', // One-time payment is immediately active
          stripe_customer_id: session.customer as string,
          stripe_sessie_id: session.id,
          start_datum: new Date().toISOString(),
          eind_datum: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          bedrag: session.amount_total,
          currency: session.currency,
          // Leave stripe_subscription_id as null for one-time payments
        };

        const { error } = await supabase
          .from("abonnementen")
          .upsert(paymentData, { onConflict: "stripe_sessie_id" });

        if (error) {
          console.error("❌ Failed to insert payment record:", error);
          return new Response(`Database error: ${error.message}`, { status: 500, headers: responseHeaders });
        } else {
          console.log("✅ One-time payment recorded successfully");
        }

        // ✅ Notificatie maken voor eenmalige betaling
        const { error: notificationError } = await supabase.from("notificaties").insert({
          gebruiker_id: userId,
          type: "payment_success",
          titel: "Betaling succesvol",
          inhoud:
            "Je betaling is ontvangen. Je hebt nu toegang tot alle functies van Huurly.",
          gelezen: false,
        });

        if (notificationError) {
          console.error("❌ Failed to create notification", {
            userId,
            error: notificationError,
          });
        }

        console.log("✅ One-time payment processing completed");
        return new Response(JSON.stringify({ received: true }), {
          headers: responseHeaders,
          status: 200,
        });
      }

      // Handle subscription-based payments (existing logic)
      if (!session.subscription) {
        console.error("❌ No subscription ID in session for subscription mode");
        return new Response("Missing subscription ID", { status: 400, headers: responseHeaders });
      }

      // ✅ Haal Stripe subscription details op
      const subscription = await stripe.subscriptions.retrieve(session.subscription);

      console.log("✅ Stripe subscription retrieved:", {
        id: subscription.id,
        status: subscription.status,
        mappedStatus: mapStripeStatusToDutch(subscription.status)
      });

      // For checkout.session.completed, use current_period_start and current_period_end
      const startDate = subscription.current_period_start;
      const endDate = subscription.current_period_end;

      if (startDate === undefined || endDate === undefined) {
        console.error("❌ Missing subscription period data in Stripe subscription object");
        return new Response("Missing subscription period data", { status: 500, headers: responseHeaders });
      }

      // ✅ Voeg abonnement toe of update bestaande
      const subscriptionData = {
        huurder_id: userId,
        status: mapStripeStatusToDutch(subscription.status),
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        stripe_sessie_id: session.id,
        start_datum: new Date(startDate * 1000).toISOString(),
        eind_datum: new Date(endDate * 1000).toISOString(),
        bedrag: session.amount_total,
        currency: session.currency,
      };


      const { error } = await supabase
        .from("abonnementen")
        .upsert(subscriptionData, { onConflict: "stripe_subscription_id" });

      if (error) {
        console.error("❌ Failed to insert abonnement:", error);
        return new Response(`Database error: ${error.message}`, { status: 500, headers: responseHeaders });
      } else {
        console.log("✅ Abonnement inserted/updated successfully");
      }

      // ✅ Notificatie maken
      const { error: notificationError } = await supabase.from("notificaties").insert({
        gebruiker_id: userId,
        type: "payment_success",
        titel: "Betaling succesvol",
        inhoud:
          "Je jaarlijkse abonnement is geactiveerd. Je hebt nu toegang tot alle functies van Huurly.",
        gelezen: false,
      });

      if (notificationError) {
        console.error("❌ Failed to create notification", {
          userId,
          error: notificationError,
        });
      }
    }

    // === CHECKOUT SESSION FAILED / EXPIRED ===
    if (
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "checkout.session.expired"
    ) {
      const session = event.data.object as ExtendedSession;

      const { error: paymentError } = await supabase
        .from("abonnementen")
        .update({
          status: "geannuleerd",
        })
        .eq("stripe_sessie_id", session.id);

      if (paymentError) {
        console.error("❌ Failed to mark payment as failed", {
          sessionId: session.id,
          error: paymentError,
        });
      }
    }

    // === SUBSCRIPTION UPDATED / CANCELLED ===
    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;

      const startDate = subscription.current_period_start;
      const endDate = subscription.current_period_end;

      const updateData: { status: string; start_datum?: string; eind_datum?: string } = {
        status: mapStripeStatusToDutch(subscription.status),
      };

      if (startDate !== undefined) {
        updateData.start_datum = new Date(startDate * 1000).toISOString();
      }
      if (endDate !== undefined) {
        updateData.eind_datum = new Date(endDate * 1000).toISOString();
      }

      const { error } = await supabase
        .from("abonnementen")
        .update(updateData)
        .eq("stripe_subscription_id", subscription.id);

      if (error) {
        console.error("❌ Failed to update subscription status", {
          subscriptionId: subscription.id,
          error,
        });
      } else {
        console.log("✅ Subscription status updated:", {
          subscriptionId: subscription.id,
          status: subscription.status,
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: responseHeaders,
      status: 200,
    });
  } catch (error: any) {
    console.error("❌ Webhook error:", error);
    return new Response(`Webhook Error: ${error.message}`, { status: 400, headers: responseHeaders });
  }
});
