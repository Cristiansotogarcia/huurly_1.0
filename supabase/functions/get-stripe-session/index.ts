import { serve } from 'http/server';
import Stripe from 'stripe';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  timeout: 30000, // 30 seconds
  maxNetworkRetries: 3
});

serve(async (req: Request) => {
  const origin = req.headers.get('Origin') || '';
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(JSON.stringify({ error: 'Session ID is required.' }), {
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription'],
    });

    return new Response(JSON.stringify({ session }), {
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error retrieving Stripe session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});