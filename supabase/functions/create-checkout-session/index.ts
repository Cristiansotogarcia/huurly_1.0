import { serve } from "http/server";
import Stripe from "stripe";
import { createClient} from "@supabase/supabase-js";

// Enhanced CORS headers with proper origin handling
const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://huurly-1-0.vercel.app',
    'https://huurly.nl',
    'https://www.huurly.nl'
  ];
  
  const isAllowed = origin && allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://huurly.nl',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT-SESSION] ${step}${detailsStr}`);
};

// Cache environment variables and initialize clients once
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Validate environment variables once at startup
const missingVars = [];
if (!stripeSecretKey) missingVars.push("STRIPE_SECRET_KEY");
if (!supabaseUrl) missingVars.push("SUPABASE_URL");
if (!supabaseServiceKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");

if (missingVars.length > 0) {
  throw new Error(`Ontbrekende omgevingsvariabelen: ${missingVars.join(", ")}`);
}

if (!stripeSecretKey.startsWith("sk_")) {
  throw new Error("Ongeldig Stripe secret key formaat");
}

// Initialize Stripe client once
const stripe = new Stripe(stripeSecretKey, { 
  apiVersion: "2023-10-16"
});

const getUser = async (req: Request) => {
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: { persistSession: false },
  });
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
  const headers = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers,
    });
  }

  try {
    // Create Supabase client for this request
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: { persistSession: false },
    });

    const body = await req.json();
    const { priceId, successUrl, cancelUrl, userId, userEmail } = body;

    if (!priceId) {
      return new Response(JSON.stringify({ error: "Prijs ID is vereist" }), { status: 400, headers });
    }

    // Parallelize user lookup and customer resolution preparation
    const user = await getUser(req);
    const emailToUse = user?.email || userEmail;
    const userIdToUse = user?.id || userId;

    if (!emailToUse) {
      return new Response(JSON.stringify({ error: "Gebruiker email is vereist" }), { status: 400, headers });
    }

    const customer = await resolveCustomer(stripe, emailToUse, userIdToUse);
    logStep("CUSTOMER_RESOLVED", { customerId: customer.id });

    // Create session payload with optimized structure
    const sessionPayload = {
      customer: customer.id,
      payment_method_types: ["card", "ideal"],
      mode: "subscription" as const,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${req.headers.get("origin")}/payment-success`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/dashboard`,
      locale: "nl" as const,
      subscription_data: {
        metadata: { user_id: userIdToUse },
      },
      metadata: { user_id: userIdToUse },
    };

    const session = await stripe.checkout.sessions.create(sessionPayload);

    logStep("SESSION_CREATED", { sessionId: session.id });
    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers,
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: "Er is een fout opgetreden bij het verwerken van de betaling" }), {
      headers,
      status: 500,
    });
  }
});
