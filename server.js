import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });

const app = express();
app.use(cors());

// Stripe webhook needs the raw body to verify the signature
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    console.log('Received Stripe event:', event.type);
    // TODO: handle event types and update your database
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.use(express.json());

app.post('/api/create-checkout-session', async (req, res, next) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: req.body.priceId, quantity: 1 }],
      success_url: req.body.successUrl,
      cancel_url: req.body.cancelUrl,
      customer_email: req.body.userEmail,
      metadata: {
        userId: req.body.userId,
        paymentRecordId: req.body.paymentRecordId,
      },
    });
    res.json({ sessionId: session.id });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
