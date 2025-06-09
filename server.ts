import dotenv from 'dotenv';
import { logger } from './src/lib/logger.ts';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import http from 'http';

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

const stripe = new Stripe(STRIPE_SECRET_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

interface CheckoutSessionBody {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  userEmail: string;
  userId: string;
  paymentRecordId: string;
}

function parseJson(req: http.IncomingMessage): Promise<CheckoutSessionBody> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer) => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data) as CheckoutSessionBody); }
      catch (err) { reject(err); }
    });
  });
}

function getRawBody(req: http.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

const server = http.createServer(async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/create-checkout-session') {
    try {
      const body = await parseJson(req);
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price: body.priceId, quantity: 1 }],
        success_url: body.successUrl,
        cancel_url: body.cancelUrl,
        customer_email: body.userEmail,
        metadata: { userId: body.userId, paymentRecordId: body.paymentRecordId }
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ sessionId: session.id }));
    } catch (err) {
      logger.error('Error creating Stripe session:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unable to create session' }));
    }
  } else if (req.method === 'POST' && req.url === '/api/stripe-webhook') {
    const buf = await getRawBody(req);
      const sig = req.headers['Stripe-Signature'];
    
    if (!sig) {
      logger.error('Missing Stripe signature header');
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing signature header');
      return;
    }

    if (!STRIPE_WEBHOOK_SECRET) {
      logger.error('Missing Stripe webhook secret');
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server configuration error');
      return;
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET);
      logger.info('Received verified Stripe event:', event.type);
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, paymentRecordId } = session.metadata || {};

        const paymentRecordUUID = paymentRecordId ? String(paymentRecordId) : null;
        const userUUID = userId ? String(userId) : null;
        const stripeCustomerId = session.customer ? String(session.customer) : null;

        logger.info('Webhook session metadata', {
          paymentRecordUUID,
          userUUID,
          stripeCustomerId,
        });

        // Update payment record status
        if (paymentRecordUUID) {
          const { error: paymentUpdateError } = await supabase
            .from('payment_records')
            .update({
              status: 'completed',
              stripe_customer_id: stripeCustomerId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', paymentRecordUUID);

          if (paymentUpdateError) {
            logger.error('Failed to update payment record', {
              paymentRecordUUID,
              stripeCustomerId,
              error: paymentUpdateError,
            });
          }
        }

        // Update user subscription status
        if (userUUID) {
          const { error: userRoleError } = await supabase
            .from('user_roles')
            .update({ subscription_status: 'active' })
            .eq('user_id', userUUID);

          if (userRoleError) {
            logger.error('Failed to update user role', { userUUID, error: userRoleError });
          }

          const expiry = new Date();
          expiry.setFullYear(expiry.getFullYear() + 1);

          const { error: subError } = await supabase.from('subscribers').upsert(
            {
              user_id: userUUID,
              email: session.customer_details?.email || session.customer_email,
              stripe_customer_id: stripeCustomerId,
              subscribed: true,
              subscription_tier: 'huurder_yearly',
              subscription_end: expiry.toISOString(),
            },
            { onConflict: 'user_id' }
          );

          if (subError) {
            logger.error('Failed to upsert subscriber', {
              userUUID,
              stripeCustomerId,
              error: subError,
            });
          }
        }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ received: true }));
    } catch (err) {
      logger.error('Webhook error:', err);
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end(`Webhook Error: ${err.message}`);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

const PORT = process.env.PORT || 4242;
server.listen(PORT, () => logger.info(`Stripe server listening on ${PORT}`));
