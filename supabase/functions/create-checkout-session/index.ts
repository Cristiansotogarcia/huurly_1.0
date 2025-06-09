
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Edge Function Start ===');
    
    // Check environment variables
    // Note: SUPABASE_URL and SUPABASE_ANON_KEY are automatically available in Supabase Edge Functions
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseAnonKey: !!supabaseAnonKey,
      hasStripeSecretKey: !!stripeSecretKey,
      supabaseUrlPrefix: supabaseUrl?.substring(0, 30) + '...',
    });

    if (!stripeSecretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables not available');
    }

    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      console.error('User authentication error:', userError);
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      console.error('User data:', { hasUser: !!user, hasEmail: !!user?.email });
      throw new Error("User not authenticated or email not available");
    }

    console.log('User authenticated:', { userId: user.id, email: user.email });

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20", // Updated to latest stable version
    });

    // Parse request body
    const body = await req.json();
    const { priceId, userId, userEmail, paymentRecordId, successUrl, cancelUrl } = body;
    
    console.log('Request body:', { priceId, userId, userEmail, paymentRecordId, hasSuccessUrl: !!successUrl, hasCancelUrl: !!cancelUrl });

    // Validate required fields
    if (!priceId) throw new Error("Missing priceId");
    if (!successUrl) throw new Error("Missing successUrl");
    if (!cancelUrl) throw new Error("Missing cancelUrl");

    // Check if customer exists
    console.log('Checking for existing customer...');
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('Found existing customer:', customerId);
    } else {
      console.log('No existing customer found');
    }

    // Create checkout session
    console.log('Creating checkout session...');
    const sessionParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment' as const,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { 
        userId: userId || user.id, 
        paymentRecordId: paymentRecordId || 'auto-generated'
      }
    };
    
    console.log('Session params:', sessionParams);
    
    const session = await stripe.checkout.sessions.create(sessionParams);
    
    console.log('Checkout session created successfully:', session.id);

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('=== Edge Function Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      type: error.constructor.name,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
