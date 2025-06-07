const http = require('http');
const Stripe = require('stripe');
require('dotenv').config();
const logger = require('./src/lib/logger').default;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });

function parseJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch (err) { reject(err); }
    });
  });
}

function getRawBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

const server = http.createServer(async (req, res) => {
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
      console.error('Error creating Stripe session:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unable to create session' }));
    }
  } else if (req.method === 'POST' && req.url === '/api/stripe-webhook') {
    const buf = await getRawBody(req);
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, STRIPE_WEBHOOK_SECRET);
      logger.info({ eventType: event.type }, 'Received Stripe event');
      // TODO: handle event types and update your database
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ received: true }));
    } catch (err) {
      console.error('Webhook error:', err);
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
