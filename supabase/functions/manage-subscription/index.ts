import { serve } from "http/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { action, subscriptionId } = await req.json();

    if (!subscriptionId || !action) {
      return new Response("Invalid request", { status: 400, headers: corsHeaders });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });

    let subscription: Stripe.Subscription;
    if (action === "cancel") {
      subscription = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    } else if (action === "resume") {
      subscription = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false });
    } else {
      return new Response("Unknown action", { status: 400, headers: corsHeaders });
    }

    // Optionally update in Supabase - webhook will handle final status
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    await supabase.from("abonnementen").update({ status: subscription.status }).eq("stripe_subscription_id", subscription.id);

    return new Response(JSON.stringify({ status: subscription.status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("manage-subscription error", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
