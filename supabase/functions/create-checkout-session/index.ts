import { serve } from "http/server";
import Stripe from "stripe";
import { createClient} from "@supabase/supabase-js";
import { corsHeaders } from '../_shared/cors.ts';

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT-SESSION] ${step}${detailsStr}`);
};

const initializeClients = () => {
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  const missingVars = [];
  if (!stripeSecretKey) missingVars.push("STRIPE_SECRET_KEY");
  if (!supabaseUrl) missingVars.push("SUPABASE_URL");
  if (!supabaseServiceKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missingVars.length > 0) {
    logStep("ERROR", { 
      message: "Missing required environment variables",
      missing: missingVars
    });
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
  }

  // Validate Stripe key format
  if (!stripeSecretKey.startsWith("sk_")) {
    logStep("ERROR", { 
      message: "Invalid Stripe secret key format",
      keyPrefix: stripeSecretKey.substring(0, 5)
    });
    throw new Error("Invalid Stripe secret key format");
  }

  const stripe = new Stripe(stripeSecretKey, { 
    apiVersion: "2023-10-16"
  });
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

// Removed updatePaymentRecord function - webhook will handle all database operations

serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  try {
    const { stripe, supabase } = initializeClients();
    const body = await req.json();
    logStep("REQUEST_BODY", body);
    const { priceId, successUrl, cancelUrl, userId, userEmail } = body;

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
        },
      },
      metadata: {
        user_id: userIdToUse,
      },
    };

    logStep("SESSION_PAYLOAD", sessionPayload);

    const session = await stripe.checkout.sessions.create(sessionPayload);

    logStep("SESSION_CREATED", { sessionId: session.id, url: session.url });
    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
