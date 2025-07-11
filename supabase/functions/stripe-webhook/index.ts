import { serve } from "http/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Zorg dat deze function geen Supabase-auth vereist
export const config = {
  auth: false,
};

// Helper function to map Stripe subscription status to Dutch enum values
const mapStripeStatusToDutch = (stripeStatus: string ): string => {
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

import { corsHeaders } from '../_shared/cors.ts';

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
  subscription: string;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
};

serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("Missing Stripe signature header");
      return new Response("Missing signature header", { status: 400 });
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("Missing Stripe webhook secret");
      return new Response("Server configuration error", { status: 500 });
    }

    let event;
    try {
      // Corrected: Use await constructEventAsync for asynchronous context
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log("✅ Verified Stripe event:", event.type);
    } catch (err: any) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // === CHECKOUT SESSION COMPLETED ===
    if (event.type === "checkout.session.completed") {
      console.log("🎯 Processing checkout.session.completed event");
      const session = event.data.object as ExtendedSession;
      const userId = session.metadata?.user_id;

      console.log("📋 Session details:", {
        sessionId: session.id,
        userId: userId,
        subscriptionId: session.subscription,
        paymentStatus: session.payment_status
      });

      if (!userId) {
        console.error("❌ User ID not found in session metadata");
        return new Response("Missing user ID", { status: 400 });
      }

      if (!session.subscription) {
        console.error("❌ No subscription ID in session");
        return new Response("Missing subscription ID", { status: 400 });
      }

      // ✅ Haal Stripe subscription details op
      console.log("🔍 Retrieving subscription from Stripe:", session.subscription);
      // @ts-ignore - Stripe types
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      
      console.log("📊 Stripe subscription details:", {
        id: subscription.id,
        status: subscription.status,
        mappedStatus: mapStripeStatusToDutch(subscription.status)
      });

      // For checkout.session.completed, use current_period_start and current_period_end
      // from the retrieved subscription object.
      const startDate = subscription.current_period_start;
      let endDate = subscription.current_period_end;

      // Fallback for endDate if not directly available (e.g., for trial subscriptions without explicit end_date yet)
      if (endDate === undefined && subscription.items.data[0]?.plan) {
        const plan = subscription.items.data[0].plan;
        if (plan.interval && plan.interval_count) {
          const start = new Date(startDate * 1000);
          let end = new Date(start);
          if (plan.interval === 'month') {
            end.setMonth(start.getMonth() + plan.interval_count);
          } else if (plan.interval === 'year') {
            end.setFullYear(start.getFullYear() + plan.interval_count);
          }
          endDate = Math.floor(end.getTime() / 1000); // Convert back to Unix timestamp
        }
      }

      if (startDate === undefined || endDate === undefined) {
        console.error("❌ Missing subscription period data in Stripe subscription object");
        return new Response("Missing subscription period data", { status: 500 });
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
      
      console.log("💾 Upserting subscription data:", subscriptionData);
      
      const { error } = await supabase
        .from("abonnementen")
        .upsert(subscriptionData, { onConflict: "stripe_subscription_id" });

      if (error) {
        console.error("❌ Failed to insert abonnement:", error);
        return new Response(`Database error: ${error.message}`, { status: 500 });
      } else {
        console.log("✅ Successfully upserted subscription for user:", userId);
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

      // For subscription updates, current_period_start and current_period_end are usually reliable.
      const startDate = subscription.current_period_start;
      const endDate = subscription.current_period_end;

      if (startDate === undefined || endDate === undefined) {
        console.error("❌ Missing subscription period data for update");
        // Depending on your logic, you might want to return an error response here
        // or handle this case differently if these fields are not always present
      }

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
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("❌ Webhook error:", error);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }
});
