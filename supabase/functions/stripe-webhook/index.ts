import { serve } from "http/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

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

// CORS headers for browser-based calls
const vercelUrl = Deno.env.get("VERCEL_URL");
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];
if (vercelUrl) {
  allowedOrigins.push(`https://${vercelUrl}`);
}

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// Verbreding van Stripe session object
type ExtendedSession = Stripe.Checkout.Session & {
  id: string;
  subscription: string;
};

serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
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
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("✅ Verified Stripe event:", event.type);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // === CHECKOUT SESSION COMPLETED ===
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as ExtendedSession;
      const userId = session.metadata?.user_id;

      if (!userId) {
        console.error("❌ User ID not found in session metadata");
        return new Response("Missing user ID", { status: 400 });
      }

      if (!session.subscription) {
        console.error("❌ No subscription ID in session");
        return new Response("Missing subscription ID", { status: 400 });
      }



      // ✅ Haal Stripe subscription details op
      const subscription = await stripe.subscriptions.retrieve(session.subscription);

      // ✅ Voeg abonnement toe of update bestaande
      const { error } = await supabase
        .from("abonnementen")
        .upsert(
          {
            huurder_id: userId,
            status: mapStripeStatusToDutch(subscription.status),
            stripe_subscription_id: subscription.id,
            stripe_sessie_id: session.id,
            start_datum: new Date(subscription.items.data[0].period.start * 1000).toISOString(),
            eind_datum: new Date(subscription.items.data[0].period.end * 1000).toISOString(),
            bedrag: 6500,
            currency: "eur",
          },
          { onConflict: "stripe_subscription_id" }
        );

      if (error) {
        console.error("❌ Failed to insert abonnement:", error);
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

      const { error } = await supabase
        .from("abonnementen")
        .update({
          status: mapStripeStatusToDutch(subscription.status),
          start_datum: new Date(subscription.items.data[0].period.start * 1000).toISOString(),
          eind_datum: new Date(subscription.current_period_end * 1000).toISOString(),
        })
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
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }
});
