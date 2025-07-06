
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT-SESSION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  try {
    logStep("Function started");

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration is missing");
    }

    logStep("Environment variables validated");

    const { priceId, successUrl, cancelUrl, userId, userEmail, paymentRecordId } = await req.json();

    if (!priceId) {
      throw new Error("Price ID is required");
    }

    logStep("Request body parsed", { priceId, userId, userEmail });

    // Initialize Supabase client with service role for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Get authenticated user if authorization header is present
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      if (!userError && userData.user) {
        user = userData.user;
        logStep("User authenticated", { userId: user.id, email: user.email });
      }
    }

    // Use user from auth header or fallback to provided userEmail
    const emailToUse = user?.email || userEmail;
    const userIdToUse = user?.id || userId;

    if (!emailToUse) {
      throw new Error("User email is required");
    }

    logStep("User data resolved", { email: emailToUse, userId: userIdToUse });

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Check for existing customer
    const { data: customers } = await stripe.customers.list({
      email: emailToUse,
      limit: 1,
    });

    let customer = customers.length > 0 ? customers[0] : await stripe.customers.create({
      email: emailToUse,
      metadata: { user_id: userIdToUse || 'unknown' },
    });

    logStep("Customer resolved", { customerId: customer.id, isNew: customers.length === 0 });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card", "ideal"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${req.headers.get("origin")}/payment-success`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/dashboard`,
      subscription_data: {
        metadata: {
          user_id: userIdToUse || 'unknown',
          payment_record_id: paymentRecordId || 'unknown',
        },
      },
      metadata: {
        user_id: userIdToUse || 'unknown',
        payment_record_id: paymentRecordId || 'unknown',
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Update payment record if provided
    if (paymentRecordId) {
      try {
        const { error: updateError } = await supabase
          .from('betalingen')
          .update({
            stripe_sessie_id: session.id,
            bijgewerkt_op: new Date().toISOString(),
          })
          .eq('id', paymentRecordId);

        if (updateError) {
          console.error('Failed to update payment record:', updateError);
        } else {
          logStep("Payment record updated", { paymentRecordId });
        }
      } catch (error) {
        console.error('Error updating payment record:', error);
      }
    }

    return new Response(JSON.stringify({
      sessionId: session.id,
      url: session.url,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
