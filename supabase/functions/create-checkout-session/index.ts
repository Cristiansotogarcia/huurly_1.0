import { serve } from "http/server";
import Stripe from "stripe";
import { createClient} from "@supabase/supabase-js";
import { corsHeaders } from '../_shared/cors.ts';

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[${new Date().toISOString()}] ${step}${detailsStr}`);
};

// Cache environment variables and initialize clients once
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY");

// Validate environment variables once at startup
const missingVars = [];
if (!stripeSecretKey) missingVars.push("STRIPE_SECRET_KEY");
if (!supabaseUrl) missingVars.push("SUPABASE_URL");
if (!supabaseServiceKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY or SERVICE_ROLE_KEY");

if (missingVars.length > 0) {
  console.error("❌ Missing environment variables:", missingVars);
  throw new Error(`Ontbrekende omgevingsvariabelen: ${missingVars.join(", ")}`);
}

// Initialize clients once
const stripe = new Stripe(stripeSecretKey, { 
  apiVersion: "2023-10-16"
});
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

const getUser = async (req: Request, supabase: ReturnType<typeof createClient>) => {
  // For Supabase Edge Functions, the JWT is automatically available
  // We can get the user directly from the service role client
  try {
    // Get the authenticated user from the request context
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return null;
    }

    const token = authHeader.replace("Bearer ", "");

    // Use the service role client to verify the user
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) {
      console.log("User authenticated successfully:", user.id);
      return user;
    } else {
      console.error("Error getting user from token:", error);
      return null;
    }
  } catch (error) {
    console.error("Error in getUser:", error);
    return null;
  }
};

const resolveCustomer = async (stripe: InstanceType<typeof Stripe>, email: string, userId: string) => {
  // Optimized: Try to create customer directly, handle duplicate error
  try {
    return await stripe.customers.create({
      email,
      metadata: { user_id: userId || "unknown" },
    });
  } catch (error: any) {
    // If customer already exists, find and return it
    if (error.code === 'resource_already_exists' || error.message?.includes('already exists')) {
      const { data: customers } = await stripe.customers.list({ email, limit: 1 });
      if (customers.length > 0) {
        return customers[0];
      }
    }
    throw error;
  }
};

// Removed updatePaymentRecord function - webhook will handle all database operations

serve(async (req) => {
  const origin = req.headers.get("Origin") || "";
  const responseHeaders = {
    ...corsHeaders,
    "Content-Type": "application/json"
  };
  
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: responseHeaders,
    });
  }

  try {
    const startTime = Date.now();
    logStep("REQUEST_STARTED", { method: req.method, url: req.url, timestamp: startTime });

    // TEMPORARY: Log available environment variables for debugging
    const availableEnvVars = {
      hasStripeSecret: !!stripeSecretKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseServiceKey: !!supabaseServiceKey,
      stripeKeyPrefix: stripeSecretKey ? stripeSecretKey.substring(0, 10) + '...' : 'none',
      supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'none',
      allEnvKeys: Object.keys(Deno.env.toObject()).filter(key =>
        key.includes('STRIPE') || key.includes('SUPABASE') || key.includes('SERVICE')
      )
    };
    logStep("ENVIRONMENT_CHECK", availableEnvVars);

    // If environment variables are missing, return a helpful error
    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      logStep("MISSING_ENV_VARS", {
        missing: {
          STRIPE_SECRET_KEY: !stripeSecretKey,
          SUPABASE_URL: !supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: !supabaseServiceKey
        }
      });
      return new Response(JSON.stringify({
        error: "Server configuratie ontbreekt",
        details: "Environment variabelen zijn niet ingesteld in Supabase project. Neem contact op met de beheerder.",
        missingVars: {
          STRIPE_SECRET_KEY: !stripeSecretKey,
          SUPABASE_URL: !supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: !supabaseServiceKey
        }
      }), { status: 500, headers: responseHeaders });
    }

    logStep("PARSING_REQUEST_BODY", { elapsed: Date.now() - startTime });
    const body = await req.json();
    const { priceId, successUrl, cancelUrl, userId, userEmail } = body;

    logStep("REQUEST_BODY_PARSED", {
      priceId: !!priceId,
      userId: !!userId,
      userEmail: !!userEmail,
      bodyKeys: Object.keys(body),
      elapsed: Date.now() - startTime
    });

    if (!priceId) {
      logStep("VALIDATION_ERROR", { reason: "missing_price_id" });
      return new Response(JSON.stringify({ error: "Prijs ID is vereist" }), { status: 400, headers: responseHeaders });
    }

    // Check JWT and get user
    logStep("GETTING_USER_FROM_JWT", { elapsed: Date.now() - startTime });
    const user = await getUser(req, supabase);
    const emailToUse = user?.email || userEmail;
    const userIdToUse = user?.id || userId;

    logStep("USER_RESOLVED", {
      hasUser: !!user,
      emailToUse: !!emailToUse,
      userIdToUse: !!userIdToUse,
      userEmail: user?.email,
      providedEmail: userEmail,
      elapsed: Date.now() - startTime
    });

    if (!emailToUse) {
      logStep("VALIDATION_ERROR", { reason: "missing_email" });
      return new Response(JSON.stringify({ error: "Gebruiker email is vereist" }), { status: 400, headers: responseHeaders });
    }

    // Create Stripe customer
    logStep("CREATING_STRIPE_CUSTOMER", { email: emailToUse, elapsed: Date.now() - startTime });
    let customer;
    try {
      customer = await resolveCustomer(stripe, emailToUse, userIdToUse);
      logStep("CUSTOMER_RESOLVED", { customerId: customer.id, elapsed: Date.now() - startTime });
    } catch (stripeError: any) {
      logStep("STRIPE_CUSTOMER_ERROR", {
        code: stripeError.code,
        type: stripeError.type,
        message: stripeError.message,
        elapsed: Date.now() - startTime
      });
      return new Response(JSON.stringify({
        error: "Fout bij het aanmaken van Stripe klant",
        details: stripeError.message
      }), { status: 500, headers: responseHeaders });
    }

    // Create session payload with optimized structure
    const sessionPayload = {
      customer: customer.id,
      payment_method_types: ["card", "ideal"],
      mode: "payment" as const,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${req.headers.get("origin")}/payment-success`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/dashboard`,
      locale: "nl" as const,
      metadata: { user_id: userIdToUse },
    };

    logStep("CREATING_CHECKOUT_SESSION", {
      customerId: customer.id,
      priceId,
      payload: sessionPayload,
      elapsed: Date.now() - startTime
    });

    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionPayload);
      logStep("SESSION_CREATED", {
        sessionId: session.id,
        url: !!session.url,
        urlLength: session.url?.length,
        elapsed: Date.now() - startTime
      });
    } catch (stripeError: any) {
      logStep("STRIPE_SESSION_ERROR", {
        code: stripeError.code,
        type: stripeError.type,
        message: stripeError.message,
        param: stripeError.param,
        requestId: stripeError.requestId,
        elapsed: Date.now() - startTime
      });

      // Provide specific error messages based on Stripe error types
      let errorMessage = "Er is een fout opgetreden bij het verwerken van de betaling";
      if (stripeError.code === 'resource_missing') {
        errorMessage = "Prijs niet gevonden. Controleer de prijsconfiguratie.";
      } else if (stripeError.code === 'invalid_request_error') {
        errorMessage = "Ongeldige betalingsaanvraag. Controleer de invoergegevens.";
      }

      return new Response(JSON.stringify({
        error: errorMessage,
        details: stripeError.message
      }), { status: 500, headers: responseHeaders });
    }

    const totalTime = Date.now() - startTime;
    logStep("REQUEST_COMPLETED", { sessionId: session.id, totalTimeMs: totalTime });
    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: responseHeaders,
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const totalTime = Date.now() - (Date.now() - 10000); // Approximate start time
    logStep("UNEXPECTED_ERROR", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      totalTimeMs: totalTime
    });
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({
      error: "Er is een onverwachte fout opgetreden bij het verwerken van de betaling",
      details: errorMessage
    }), {
      headers: responseHeaders,
      status: 500,
    });
  }
});
