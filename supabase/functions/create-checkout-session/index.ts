import { serve } from "http/server";
import Stripe from "stripe";
import { createClient} from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT-SESSION] ${step}${detailsStr}`);
};

const initializeClients = () => {
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing required environment variables");
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  return { stripe, supabase };
};

const getUser = async (req: Request, supabase: ReturnType<typeof createClient>) => {
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    const { data, error } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!error && data.user) {
      return data.user;
    }
  }
  return null;
};

const resolveCustomer = async (stripe: InstanceType<typeof Stripe>, email: string, userId: string) => {
  const { data: customers } = await stripe.customers.list({ email, limit: 1 });
  if (customers.length > 0) {
    return customers[0];
  }
  return stripe.customers.create({
    email,
    metadata: { user_id: userId || "unknown" },
  });
};

const updatePaymentRecord = async (
  supabase: ReturnType<typeof createClient>,
  paymentRecordId: string,
  sessionId: string
) => {
  if (!paymentRecordId) return;

  try {
    const { error } = await supabase
      .from("betalingen")
      .update({
        stripe_sessie_id: sessionId,
      })
      .eq("id", paymentRecordId);

    if (error) {
      console.error("Failed to update payment record:", error);
    }
  } catch (error) {
    console.error("Error updating payment record:", error);
  }
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
    const { stripe, supabase } = initializeClients();
    const body = await req.json();
    logStep("REQUEST_BODY", body);
    const { priceId, successUrl, cancelUrl, userId, userEmail, paymentRecordId } = body;

    if (!priceId) {
      logStep("ERROR", { message: "Price ID is required" });
      return new Response(JSON.stringify({ error: "Price ID is required" }), { status: 400 });
    }

    const user = await getUser(req, supabase);
    const emailToUse = user?.email || userEmail;
    const userIdToUse = user?.id || userId;
    logStep("USER_IDENTIFIED", { userId: userIdToUse, email: emailToUse, authUser: !!user });

    if (!emailToUse) {
      logStep("ERROR", { message: "User email is required" });
      return new Response(JSON.stringify({ error: "User email is required" }), { status: 400 });
    }

    const customer = await resolveCustomer(stripe, emailToUse, userIdToUse);
    logStep("CUSTOMER_RESOLVED", { customerId: customer.id });

    const sessionPayload: Record<string, any> = {
      customer: customer.id,
      payment_method_types: ["card", "ideal"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${req.headers.get("origin")}/payment-success`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/dashboard`,
      subscription_data: {
        metadata: {
          user_id: userIdToUse,
          payment_record_id: paymentRecordId,
        },
      },
      metadata: {
        user_id: userIdToUse,
        payment_record_id: paymentRecordId,
      },
    };

    logStep("SESSION_PAYLOAD", sessionPayload);

    const session = await stripe.checkout.sessions.create(sessionPayload);

    logStep("UPDATING_PAYMENT_RECORD", { paymentRecordId, sessionId: session.id });
    await updatePaymentRecord(supabase, paymentRecordId, session.id);

    logStep("SESSION_CREATED", { sessionId: session.id, url: session.url });
    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
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
